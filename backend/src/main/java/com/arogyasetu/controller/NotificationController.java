package com.arogyasetu.controller;

import com.arogyasetu.dto.DomainDtos.*;
import com.arogyasetu.entity.User;
import com.arogyasetu.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> list(@AuthenticationPrincipal User user) {
        return notificationService.list(user.getId());
    }

    @PostMapping("/send")
    public NotificationResponse send(@Valid @RequestBody NotificationRequest request) {
        return notificationService.send(request);
    }

    @PutMapping("/read")
    public NotificationResponse read(@RequestParam UUID id) {
        return notificationService.read(id);
    }
}
