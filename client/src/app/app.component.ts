import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Form';
  form:FormGroup;
  
  constructor(private fb: FormBuilder, private apiSvc: ApiService) {}

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(form:FormGroup) {
    console.info(form.value)
    this.apiSvc.postData(form.value)
  }

  private createForm () {
    this.form = this.fb.group({
      employee_id: this.fb.control('', [Validators.required]),
      customer_id: this.fb.control('', [Validators.required]),
      product_id: this.fb.control('', [Validators.required]),
      product_qty: this.fb.control('', [Validators.required]),
    })
  }
}
