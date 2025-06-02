import { letras, numeros, especiais } from "./listaCaracteres";

export class SenhaAleatoria{
    constructor(nLetras, nEspeciais, nNumeros){
        this.nLetras = nLetras;
        this.nEspeciais = nEspeciais
        this.nNumeros = nNumeros
    }

    gerarSenha(){
        const listaLetras = this.letrasAleatorias()
        const listaEspeciais = this.caractersSpecialsAleatorios()
        const listaNumeros = this.numerosAleatorios()
        const juntarListas = [... listaLetras, ...listaEspeciais, ...listaNumeros]

        const senha = this.embaralhar(juntarListas)
        return senha
    }

      embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
     
    letrasAleatorias(){
        let lista = []
        for(let i = 0; i <this.nLetras; i++){
            let letra = letras[Math.floor(Math.random() * letras.length)]
            lista.push(letra)
        }
        return lista
    }

    numerosAleatorios(){
        let lista = []
        for(let i = 0; i <this.nNumeros; i++){
            let letra = numeros[Math.floor(Math.random() * numeros.length)]
            lista.push(letra)
        }
        return lista
    }

    caractersSpecialsAleatorios(){
        let lista = []
        for(let i = 0; i <this.nEspeciais; i++){
            let letra = especiais[Math.floor(Math.random() * especiais.length)]
            lista.push(letra)
        }
        return lista
    }
}




