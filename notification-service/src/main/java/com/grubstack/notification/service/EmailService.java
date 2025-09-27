package com.grubstack.notification.service;

import com.grubstack.notification.model.NotificationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    @KafkaListener(topics = "email-notifications", groupId = "notification-service-group")
    public void processEmailNotification(NotificationRequest notification) {
        logger.info("Processing email notification: {}", notification);
        
        try {
            sendEmail(notification);
            logger.info("Email notification sent successfully: {}", notification.getNotificationId());
        } catch (Exception e) {
            logger.error("Error sending email notification: {}", notification, e);
        }
    }
    
    public void sendEmail(NotificationRequest notification) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(notification.getRecipient());
            helper.setSubject(notification.getSubject());
            
            // Use template if available, otherwise use plain message
            String emailContent = generateEmailContent(notification);
            helper.setText(emailContent, true); // true indicates HTML
            
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", notification.getRecipient());
            
        } catch (MessagingException e) {
            logger.error("Error sending email to: {}", notification.getRecipient(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    private String generateEmailContent(NotificationRequest notification) {
        if (notification.getTemplateId() != null && notification.getTemplateData() != null) {
            return generateTemplateEmail(notification);
        } else {
            return generateSimpleEmail(notification);
        }
    }
    
    private String generateTemplateEmail(NotificationRequest notification) {
        try {
            Context context = new Context();
            
            // Add template data to context
            if (notification.getTemplateData() != null) {
                for (Map.Entry<String, Object> entry : notification.getTemplateData().entrySet()) {
                    context.setVariable(entry.getKey(), entry.getValue());
                }
            }
            
            // Add common variables
            context.setVariable("subject", notification.getSubject());
            context.setVariable("message", notification.getMessage());
            context.setVariable("notificationType", notification.getType());
            context.setVariable("priority", notification.getPriority());
            
            // Determine template name based on notification type
            String templateName;
            switch (notification.getType()) {
                case ADMIN_CREATION:
                    templateName = "email/admin-creation.html";
                    break;
                case DELIVERY_AGENT_CREATION:
                    templateName = "email/delivery-agent-creation.html";
                    break;
                case DELIVERY_AGENT_REGISTRATION:
                    templateName = "email/delivery-agent-registration.html";
                    break;
                case DELIVERY_AGENT_APPROVED:
                    templateName = "email/delivery-agent-approved.html";
                    break;
                case DELIVERY_AGENT_REJECTED:
                    templateName = "email/delivery-agent-rejected.html";
                    break;
                case DELIVERY_AGENT_DELETED:
                    templateName = "email/delivery-agent-deleted.html";
                    break;
                case ADMIN_WELCOME:
                    templateName = "email/admin-welcome.html";
                    break;
                case ADMIN_ACCOUNT_DEACTIVATED:
                    templateName = "email/admin-account-deactivated.html";
                    break;
                case ADMIN_ACCOUNT_REACTIVATED:
                    templateName = "email/admin-account-reactivated.html";
                    break;
                case ADMIN_ACCOUNT_DELETED:
                    templateName = "email/admin-account-deleted.html";
                    break;
            case ADMIN_PROFILE_UPDATED:
                templateName = "email/admin-profile-updated.html";
                break;
            case RESTAURANT_REGISTRATION_ACKNOWLEDGMENT:
                templateName = "email/restaurant-registration-acknowledgment.html";
                break;
            case RESTAURANT_APPROVED:
                templateName = "email/restaurant-approved.html";
                break;
            case RESTAURANT_DELETED:
                templateName = "email/restaurant-deleted.html";
                break;
            case WELCOME_EMAIL:
                templateName = "email/welcome-email.html";
                break;
                default:
                    templateName = "email/" + notification.getTemplateId() + ".html";
                    break;
            }
            
            return templateEngine.process(templateName, context);
            
        } catch (Exception e) {
            logger.warn("Error generating template email, falling back to simple email: {}", e.getMessage());
            return generateSimpleEmail(notification);
        }
    }
    
    private String generateSimpleEmail(NotificationRequest notification) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<title>").append(notification.getSubject()).append("</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }");
        html.append(".content { padding: 20px; background-color: #ffffff; }");
        html.append(".footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }");
        html.append(".priority-high { border-left: 4px solid #dc3545; }");
        html.append(".priority-normal { border-left: 4px solid #28a745; }");
        html.append(".priority-low { border-left: 4px solid #6c757d; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>GrubStack</h1>");
        html.append("</div>");
        html.append("<div class='content priority-").append(notification.getPriority().toString().toLowerCase()).append("'>");
        html.append("<h2>").append(notification.getSubject()).append("</h2>");
        html.append("<p>").append(notification.getMessage()).append("</p>");
        html.append("</div>");
        html.append("<div class='footer'>");
        html.append("<p>This is an automated message from GrubStack. Please do not reply to this email.</p>");
        html.append("<p>© 2025 GrubStack. All rights reserved.</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}
