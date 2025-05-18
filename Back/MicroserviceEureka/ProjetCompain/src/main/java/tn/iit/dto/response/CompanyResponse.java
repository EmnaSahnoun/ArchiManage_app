package tn.iit.dto.response;

import lombok.Data;

import java.util.Date;

@Data
public class CompanyResponse {
    private String id;
    private String name;
    private String address;
    private String email;
    private String phone;
    private Date createdAt;
}
