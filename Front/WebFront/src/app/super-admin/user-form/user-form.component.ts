import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../services/UserService';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  roles: string[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
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
    this.loadRoles();
  }
  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles.map((r: any) => r.name);
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
                    this.dialogRef.close({ success: true });
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
    this.dialogRef.close();
  }
}
