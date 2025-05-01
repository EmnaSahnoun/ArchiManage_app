package tn.iit.interfaces;

import tn.iit.entites.Compain;
import tn.iit.exception.CompainNotFoundException;

import java.util.List;

public interface ICompainService {
    Compain createCompain(Compain compain, String authToken);
    Compain updateCompain(String id, Compain updatedCompain, String authToken) throws CompainNotFoundException;
    List<Compain> findAll();
    Compain getById(String id) throws CompainNotFoundException;
    void deleteCompain(String id, String authToken) throws CompainNotFoundException;
    Compain update(String id, Compain updatedCompain) throws CompainNotFoundException;
    Compain getCompainByName(String name) throws CompainNotFoundException;
}
