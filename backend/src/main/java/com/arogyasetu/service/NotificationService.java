package com.arogyasetu.service;

import com.arogyasetu.dto.DomainDtos.NotificationRequest;
import com.arogyasetu.dto.DomainDtos.NotificationResponse;
import com.arogyasetu.entity.Notification;
import com.arogyasetu.exception.ApiException;
import com.arogyasetu.notification.NotificationGateway;
import com.arogyasetu.repository.NotificationRepository;
import com.arogyasetu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notifications;
    private final UserRepository users;
    private final NotificationGateway notificationGateway;

    public List<NotificationResponse> list(UUID userId) {
        return notifications.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public NotificationResponse send(NotificationRequest request) {
        var user = users.findById(request.userId()).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        Notification notification = notifications.save(Notification.builder()
                .user(user).type(request.type()).title(request.title()).message(request.message()).read(false).build());
        notificationGateway.publish(notification);
        return toResponse(notification);
    }

    @Transactional
    public NotificationResponse read(UUID id) {
        Notification notification = notifications.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setRead(true);
        return toResponse(notifications.save(notification));
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getNotificationId(), n.getType(), n.getTitle(), n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}
