package org.oji.shgl.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.ApiVersionConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }

    @Override
    public  void configureApiVersioning(ApiVersionConfigurer configurer) {
        configurer.useMediaTypeParameter(MediaType.parseMediaType("application/vnd.shglapp+json"), "v")
            .addSupportedVersions("1.0", "2.0")
            .setDefaultVersion("1.0");
    }
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
//        configurer.addPathPrefix("api", _ -> true);
        configurer.addPathPrefix("api", c ->
            c.isAnnotationPresent(RestController.class)     // only your controllers
            && c.getPackageName().startsWith("org.oji")    // only YOUR package
        );
    }
}
