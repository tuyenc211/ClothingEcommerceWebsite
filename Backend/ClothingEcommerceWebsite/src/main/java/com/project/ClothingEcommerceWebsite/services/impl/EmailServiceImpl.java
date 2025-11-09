package com.project.ClothingEcommerceWebsite.services.impl;

import com.project.ClothingEcommerceWebsite.services.EmailService;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    @Value("${spring.sendgrid.from-email}")
    private String fromEmail;

    private final SendGrid sendGrid;

    @Override
    public void sendResetPasswordEmail(String title, String toEmail, String resetLink) {
        String htmlContent = buildEmailTemplate(title, "đặt lại mật khẩu", resetLink, "Đặt lại mật khẩu");
        sendEmailSendGrid(title, toEmail, htmlContent);
    }

    @Override
    public void sendConfirmEmail(String title, String toEmail, String confirmLink) {
        String htmlContent = buildEmailTemplate(title, "xác thực email", confirmLink, "Xác thực ngay");
        sendEmailSendGrid(title, toEmail, htmlContent);
    }

    private void sendEmailSendGrid(String subject, String toEmail, String htmlContent) {
        Email from = new Email(fromEmail);
        Email to = new Email(toEmail);
        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, to, content);

        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);
            System.out.println("SendGrid response status: " + response.getStatusCode());
        } catch (IOException ex) {
            throw new RuntimeException("Lỗi khi gửi email qua SendGrid: " + ex.getMessage(), ex);
        }
    }

    private String buildEmailTemplate(String title, String actionText, String link, String buttonText) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f6f8;
                            padding: 20px;
                        }
                        .container {
                            background-color: #ffffff;
                            border-radius: 10px;
                            padding: 30px;
                            max-width: 480px;
                            margin: auto;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        }
                        .title {
                            font-size: 22px;
                            font-weight: bold;
                            color: #333;
                            margin-bottom: 15px;
                            text-align: center;
                        }
                        .text {
                            font-size: 14px;
                            color: #555;
                            line-height: 1.6;
                            text-align: center;
                        }
                        .button {
                            display: inline-block;
                            margin: 25px auto;
                            padding: 12px 24px;
                            background-color: #007bff;
                            color: white;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: bold;
                        }
                        .footer {
                            font-size: 12px;
                            color: #888;
                            text-align: center;
                            margin-top: 30px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="title">%s</div>
                        <div class="text">
                            Xin chào,<br><br>
                            Bạn vừa yêu cầu <b>%s</b> tài khoản của mình.<br>
                            Nhấn vào nút bên dưới để tiếp tục:
                        </div>
                        <div style="text-align: center;">
                            <a href="%s" class="button">%s</a>
                        </div>
                        <div class="footer">
                            Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.<br>
                            &copy; %d Clothing Shop.
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(title, actionText, link, buttonText, LocalDateTime.now().getYear());
    }
}
