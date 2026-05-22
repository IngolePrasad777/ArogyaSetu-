package com.arogyasetu.notification;

import com.arogyasetu.entity.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationGateway {
    private final SimpMessagingTemplate messagingTemplate;

    public void publish(Notification notification) {
        messagingTemplate.convertAndSend("/topic/users/" + notification.getUser().getId(), notification);
    }
}
