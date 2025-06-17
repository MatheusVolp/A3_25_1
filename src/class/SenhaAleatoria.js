
class SenhaAleatoria {
  constructor(options) {
   
    this.lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    this.uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.numberChars = '0123456789';
    this.specialChars = '!@#$%^&*()_+{}[]:;<>,.?/~`'; 

    
    this.length = options.length || 8; 
    this.includeUppercase = options.uppercase || false;
    this.includeLowercase = options.lowercase || false;
    this.includeNumbers = options.numbers || false;
    this.includeSpecial = options.special || false;

    
    if (!this.includeUppercase && !this.includeLowercase && !this.includeNumbers && !this.includeSpecial) {
      throw new Error("Selecione pelo menos um tipo de caractere para gerar a senha.");
    }
  }

  gerarSenhaComOpcoes() { 
    let allAllowedChars = '';
    let generatedPassword = '';

    
    if (this.includeUppercase) {
      allAllowedChars += this.uppercaseChars;
    }
    if (this.includeLowercase) {
      allAllowedChars += this.lowercaseChars;
    }
    if (this.includeNumbers) {
      allAllowedChars += this.numberChars;
    }
    if (this.includeSpecial) {
      allAllowedChars += this.specialChars;
    }

    
    if (allAllowedChars.length === 0) {
      throw new Error("Não há caracteres permitidos para gerar a senha. Verifique as opções.");
    }

    
    for (let i = 0; i < this.length; i++) {
      const randomIndex = Math.floor(Math.random() * allAllowedChars.length);
      generatedPassword += allAllowedChars[randomIndex];
    }

    return generatedPassword;
  }
}

export { SenhaAleatoria };