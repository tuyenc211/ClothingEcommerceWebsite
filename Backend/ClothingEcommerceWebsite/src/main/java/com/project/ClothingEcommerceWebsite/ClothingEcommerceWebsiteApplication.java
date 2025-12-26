package com.project.ClothingEcommerceWebsite;

<<<<<<< HEAD
=======
import io.github.cdimascio.dotenv.Dotenv;
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone;

@SpringBootApplication
public class ClothingEcommerceWebsiteApplication {
<<<<<<< HEAD
=======
	static {
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();

		dotenv.entries().forEach(e ->
				System.setProperty(e.getKey(), e.getValue())
		);
	}
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
		SpringApplication.run(ClothingEcommerceWebsiteApplication.class, args);
	}

}

