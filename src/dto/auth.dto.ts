export class AuthDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  
    constructor(firstName: string, lastName: string, email: string, password: string, role: 'admin'| 'user') {
      this.firstName = firstName,
      this.lastName = lastName
      this.email = email;
      this.password = password;
      this.role = role;
    }
  }

  export class AuthLoginDTO{
      email: string;
      password: string;
     
      constructor(email: string, password: string){
        this.email =email;
        this.password = password
      }
    
  }
  