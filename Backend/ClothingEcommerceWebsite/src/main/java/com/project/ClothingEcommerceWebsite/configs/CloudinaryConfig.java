package com.project.ClothingEcommerceWebsite.configs;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "Root",
                "api_key", "794879747219491",
                "api_secret", "FWuxg7Zf3kg9uwonLtBQ5AbeYqY",
                "secure", true
        ));
    }
}
