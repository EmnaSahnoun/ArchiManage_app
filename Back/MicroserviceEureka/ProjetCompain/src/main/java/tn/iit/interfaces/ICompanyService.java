package tn.iit.interfaces;

import tn.iit.entites.Company;
import tn.iit.exception.CompanyNotFoundException;

import java.util.List;

public interface ICompanyService {
    Company createcompany(Company company, String authToken);
    Company updatecompany(String id, Company updatedCompany, String authToken) throws CompanyNotFoundException;
    List<Company> findAll();
    Company getById(String id) throws CompanyNotFoundException;
    void deletecompany(String id, String authToken) throws CompanyNotFoundException;
    Company update(String id, Company updatedCompany) throws CompanyNotFoundException;
    Company getcompanyByName(String name) throws CompanyNotFoundException;
}
