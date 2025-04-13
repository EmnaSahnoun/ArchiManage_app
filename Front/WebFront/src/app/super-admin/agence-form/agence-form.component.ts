import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-agence-form',
  templateUrl: './agence-form.component.html',
  styleUrl: './agence-form.component.scss'
})
export class AgenceFormComponent implements OnInit {
  agenceForm: FormGroup;
  isEditMode = false;
  agencyData: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AgenceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.agenceForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  
    if (data?.isEditMode && data?.agencyData) {
      this.isEditMode = true;
      this.agenceForm.patchValue(data.agencyData);
    }
  }

  ngOnInit(): void {
    if (this.agencyData) {
      this.isEditMode = true;
      this.agenceForm.patchValue(this.agencyData);
    }
  }
  


onSubmit(): void {
  if (this.agenceForm.valid) {
    this.dialogRef.close(this.agenceForm.value);
  }
}

close(): void {
  this.dialogRef.close();
}


}
