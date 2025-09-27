package com.grubstack.user.web;

import com.grubstack.user.domain.UserAccount;
import com.grubstack.user.repo.UserAccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserAccountRepository userRepo;

    public UserController(UserAccountRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable("id") Long id) {
        Optional<UserAccount> user = userRepo.findById(id);
        if (user.isPresent()) {
            UserAccount userAccount = user.get();
            Map<String, Object> response = Map.of(
                "id", userAccount.getId(),
                "email", userAccount.getEmail(),
                "fullName", userAccount.getFullName(),
                "address", userAccount.getAddress() != null ? userAccount.getAddress() : "",
                "roles", userAccount.getRoles(),
                "createdAt", userAccount.getCreatedAt()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable("id") Long id, @RequestBody Map<String, Object> updates) {
        Optional<UserAccount> userOpt = userRepo.findById(id);
        if (userOpt.isPresent()) {
            UserAccount user = userOpt.get();
            
            if (updates.containsKey("fullName")) {
                user.setFullName((String) updates.get("fullName"));
            }
            if (updates.containsKey("address")) {
                user.setAddress((String) updates.get("address"));
            }
            
            UserAccount saved = userRepo.save(user);
            Map<String, Object> response = Map.of(
                "id", saved.getId(),
                "email", saved.getEmail(),
                "fullName", saved.getFullName(),
                "address", saved.getAddress() != null ? saved.getAddress() : "",
                "roles", saved.getRoles(),
                "createdAt", saved.getCreatedAt()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
