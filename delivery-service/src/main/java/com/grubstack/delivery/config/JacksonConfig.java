package com.grubstack.delivery.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register Hibernate module
        Hibernate5JakartaModule hibernateModule = new Hibernate5JakartaModule();
        hibernateModule.disable(Hibernate5JakartaModule.Feature.FORCE_LAZY_LOADING);
        hibernateModule.disable(Hibernate5JakartaModule.Feature.REQUIRE_EXPLICIT_LAZY_LOADING_MARKER);
        mapper.registerModule(hibernateModule);
        
        // Register Java 8 time module for Instant support
        mapper.registerModule(new JavaTimeModule());
        
        // Configure serialization features
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return mapper;
    }
}
