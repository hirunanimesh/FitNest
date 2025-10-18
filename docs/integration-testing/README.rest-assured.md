# Integration Testing with Rest Assured (API – FitNest)

Use Rest Assured to write API integration tests in Java hitting the API Gateway and services. Great for QA teams with Java ecosystems and external reporting.

## What you can test
- Black-box API behavior against running services (e.g., API Gateway)
- Auth flows, RBAC responses (401/403), validation errors, success paths
- Contract and schema checks

## Prerequisites
- Java 11+ and Maven installed
- Start backend services (VS Code Task: "🚀 Start All Microservices")

## Project setup (Maven)
Create a folder `qa/rest-assured` and add this `pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.fitnest</groupId>
  <artifactId>fitnest-rest-assured</artifactId>
  <version>1.0.0</version>
  <dependencies>
    <dependency>
      <groupId>io.rest-assured</groupId>
      <artifactId>rest-assured</artifactId>
      <version>5.5.0</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.10.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.2.5</version>
        <configuration>
          <includes>
            <include>**/*Test.java</include>
          </includes>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

## Example test (Java)
Create `src/test/java/com/fitnest/HealthTest.java`:

```java
package com.fitnest;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import org.junit.jupiter.api.*;

public class HealthTest {
  private static final String BASE = System.getProperty("BASE_URL", "http://localhost:4000");

  @Test
  void healthReturnsSuccess() {
    given()
      .baseUri(BASE)
    .when()
      .get("/health")
    .then()
      .statusCode(200)
      .body("status", equalTo("success"));
  }
}
```

## How to run (Windows PowerShell)
```powershell
# From qa/rest-assured folder
mvn test -DBASE_URL=http://localhost:4000
```

## Tips
- Use `-D` properties for base URLs and tokens per environment
- Add JSON schema validation if you maintain response schemas
- Ideal for black-box tests separate from Node toolchain

## Pros / Cons
- Pros: Strong, mature API testing in Java; great for external QA pipelines
- Cons: Separate toolchain from Node; no direct in-process testing
