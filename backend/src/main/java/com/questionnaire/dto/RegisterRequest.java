package com.questionnaire.dto;

import com.questionnaire.model.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RegisterRequest {
    @NotBlank(message = "Brugernavn er påkrævet")
    private String username;
    
    @NotBlank(message = "Fornavn er påkrævet")
    private String firstName;
    
    @NotBlank(message = "Efternavn er påkrævet")
    private String lastName;
    
    @NotBlank(message = "Password er påkrævet")
    private String password;
    
    @NotBlank(message = "Bekræft password er påkrævet")
    private String confirmPassword;
    
    @NotNull(message = "Rolle er påkrævet")
    private UserRole role;

    public RegisterRequest() {}

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}





