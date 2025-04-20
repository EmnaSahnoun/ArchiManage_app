import { Component,  Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/UserService';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  roles: string[] = [];
  isLoading = false;
  @Input() agencyId!: string;
  constructor(
    public activeModal: NgbActiveModal, // Injectez NgbActiveModal
    private fb: FormBuilder,
    private userService:UserService
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log("voici le token",localStorage.getItem("token"))
    this.loadRoles();
  }
  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        console.log("les roles avant la récupération",this.roles)
        this.roles = roles.map((r: any) => r.name);
        console.log("les roles apresssss la récupération",this.roles)
      },
      error: (err) => console.error('Failed to load roles', err)
    });
  }
  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formValue = this.userForm.value;

      const userData = {
        username: formValue.username,
        email: formValue.email,
        enabled: true,
        credentials: [{
          type: 'password',
          value: formValue.password,
          temporary: false
        }]
      };

      this.userService.createUser(userData).subscribe({
        next: (response) => {
          // Trouver l'ID de l'utilisateur créé (peut nécessiter une requête supplémentaire)
          this.assignRoleToUser(formValue.username, formValue.role);
        },
        error: (err) => {
          console.error('Failed to create user', err);
          this.isLoading = false;
        }
      });
    }
  }

  private assignRoleToUser(username: string, roleName: string): void {
    // D'abord, trouver l'ID de l'utilisateur
    this.userService.getUsers().subscribe({
      next: (users) => {
        const user = users.find((u: any) => u.username === username);
        if (user) {
          // Ensuite, trouver le rôle
          this.userService.getRoles().subscribe({
            next: (roles) => {
              const role = roles.find((r: any) => r.name === roleName);
              if (role) {
                this.userService.assignRoleToUser(user.id, role).subscribe({
                  next: () => {
                    this.isLoading = false;
                    this.activeModal.close({ success: true });
                  },
                  error: (err) => {
                    console.error('Failed to assign role', err);
                    this.isLoading = false;
                  }
                });
              }
            }
          });
        }
      },
      error: (err) => {
        console.error('Failed to find user', err);
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }
}
