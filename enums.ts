export enum TipoAeronave {
  COMERCIAL = "Comercial",
  MILITAR = "Militar"
}

export enum TipoPeca {
  NACIONAL = "Nacional", 
  IMPORTADA = "Importada"
}

export enum StatusPeca {
  EM_PRODUCAO = "Em Produção",
  EM_TRANSPORTE = "Em Transporte", 
  PRONTA = "Pronta"
}

export enum StatusEtapa {
  PENDENTE = "Pendente",
  ANDAMENTO = "Em Andamento",
  CONCLUIDA = "Concluída"
}

export enum NivelPermissao {
  ADMINISTRADOR = "Administrador",
  ENGENHEIRO = "Engenheiro",
  OPERADOR = "Operador"
}

export enum TipoTeste {
  ELETRICO = "Elétrico",
  HIDRAULICO = "Hidráulico", 
  AERODINAMICO = "Aerodinâmico"
}

export enum ResultadoTeste {
  APROVADO = "Aprovado",
  REPROVADO = "Reprovado"
}