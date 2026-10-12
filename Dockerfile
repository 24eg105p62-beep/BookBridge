# ── Stage 1: Build the JAR ──────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom first (better layer caching)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies only (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source and build (skip tests during Docker build)
COPY src ./src
RUN ./mvnw package -DskipTests -B

# ── Stage 2: Minimal runtime image ──────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S bookbridge && adduser -S bookbridge -G bookbridge
USER bookbridge

# Copy the fat JAR from builder stage
COPY --from=builder /app/target/bookbridge-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
