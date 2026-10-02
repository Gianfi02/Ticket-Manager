package it.tesina.ticketmanager.controller;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test end-to-end delle API REST su database H2 in memoria.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {

    private static final String VALID_TICKET = """
            {"title":"Stampante guasta","description":"La stampante del secondo piano non stampa",
             "requesterName":"Mario Rossi","requesterEmail":"mario.rossi@example.com","priority":"ALTA"}
            """;

    @Autowired
    private MockMvc mvc;

    private String token;

    @BeforeEach
    void login() throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andReturn().getResponse().getContentAsString();
        token = JsonPath.read(body, "$.token");
    }

    @Test
    void loginWithWrongPasswordReturns401WithMessage() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"sbagliata\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Username o password non validi"));
    }

    @Test
    void ticketsRequireAuthentication() throws Exception {
        mvc.perform(get("/api/tickets")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/tickets").header(HttpHeaders.AUTHORIZATION, "Bearer token-non-valido"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void fullTicketLifecycle() throws Exception {
        String created = mvc.perform(auth(post("/api/tickets")).content(VALID_TICKET))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.status").value("APERTO"))
                .andExpect(jsonPath("$.createdAt", notNullValue()))
                .andExpect(jsonPath("$.closedAt", nullValue()))
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(created, "$.id");

        mvc.perform(auth(get("/api/tickets")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + id + ")].title").value("Stampante guasta"));

        // Non si può chiudere un ticket APERTO
        mvc.perform(auth(patch("/api/tickets/" + id + "/close"))).andExpect(status().isConflict());

        mvc.perform(auth(patch("/api/tickets/" + id + "/take-charge")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_CARICO"));

        mvc.perform(auth(put("/api/tickets/" + id)).content(VALID_TICKET.replace("ALTA", "BASSA")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priority").value("BASSA"));

        mvc.perform(auth(patch("/api/tickets/" + id + "/close")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CHIUSO"))
                .andExpect(jsonPath("$.closedAt", notNullValue()));

        // Un ticket chiuso non è più modificabile
        mvc.perform(auth(put("/api/tickets/" + id)).content(VALID_TICKET)).andExpect(status().isConflict());

        mvc.perform(auth(delete("/api/tickets/" + id))).andExpect(status().isNoContent());
        mvc.perform(auth(get("/api/tickets/" + id))).andExpect(status().isNotFound());
    }

    @Test
    void invalidTicketReturns400WithFieldErrors() throws Exception {
        String invalid = """
                {"title":"ab","description":"","requesterName":"Mario","requesterEmail":"non-una-email","priority":"MEDIA"}
                """;
        mvc.perform(auth(post("/api/tickets")).content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.title", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.description", notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.requesterEmail").value("L'email del richiedente non è valida"));
    }

    @Test
    void invalidPriorityReturns400() throws Exception {
        mvc.perform(auth(post("/api/tickets")).content(VALID_TICKET.replace("ALTA", "URGENTISSIMA")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownTicketReturns404() throws Exception {
        mvc.perform(auth(get("/api/tickets/999999")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Il ticket #999999 non esiste"));
        mvc.perform(auth(get("/api/tickets/abc"))).andExpect(status().isBadRequest());
    }

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder builder) {
        return builder.header(HttpHeaders.AUTHORIZATION, "Bearer " + token).contentType(MediaType.APPLICATION_JSON);
    }
}
