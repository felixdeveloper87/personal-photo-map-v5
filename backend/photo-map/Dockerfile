# Multi-stage Dockerfile for PhotoMap Backend
# Supports both development and production builds

# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY src ./src

# Build arguments for environment
ARG BUILD_ENV=production
ARG MAVEN_OPTS=""

# Set Maven options based on environment
RUN if [ "$BUILD_ENV" = "development" ]; then \
        export MAVEN_OPTS="-Xmx1g"; \
    else \
        export MAVEN_OPTS="-Xmx2g"; \
    fi

# Build the JAR file
RUN mvn clean package -DskipTests $MAVEN_OPTS

# Runtime stage
FROM openjdk:21-jdk-slim
WORKDIR /app

# Create upload directory with proper permissions
RUN mkdir -p /photomap/storage/uploads && chmod 755 /photomap/storage/uploads

# Copy the generated JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Copy application.properties
COPY src/main/resources/application.properties .

# Build arguments for runtime configuration
ARG BUILD_ENV=production
ARG JAVA_OPTS=""

# Set default Java options based on environment
ENV JAVA_OPTS_DEFAULT=${JAVA_OPTS:-"-Xmx1g -Xms512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"}

# For development, add debug options
RUN if [ "$BUILD_ENV" = "development" ]; then \
        echo "Development mode - adding debug options"; \
        echo "JAVA_OPTS_DEFAULT=\"-Xmx1g -Xms512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005\"" > /app/java-opts.sh; \
    else \
        echo "Production mode - optimized settings"; \
        echo "JAVA_OPTS_DEFAULT=\"-Xmx2g -Xms1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication -XX:+OptimizeStringConcat\"" > /app/java-opts.sh; \
    fi

# Expose ports (main port + debug port for dev)
EXPOSE 8092
EXPOSE 5005

# Create startup script
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'source /app/java-opts.sh' >> /app/start.sh && \
    echo 'exec java $JAVA_OPTS_DEFAULT -jar app.jar' >> /app/start.sh && \
    chmod +x /app/start.sh

# Use startup script
CMD ["/app/start.sh"]