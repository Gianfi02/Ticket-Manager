# --- Build: compila il jar con il Maven Wrapper ---
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src/ src/
RUN ./mvnw -B -q package -DskipTests

# --- Runtime: solo JRE + jar ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Fuso orario italiano per le date dei ticket; memoria limitata per il piano gratuito di Render (512 MB)
ENV TZ=Europe/Rome \
    JAVA_OPTS="-Xmx300m -Xss512k -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
