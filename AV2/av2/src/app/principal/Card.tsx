import Style from "./Card.module.css";

type CardProps = {
  titulo: string;
  status: string | null | undefined;   
  pecasFaltantes?: number;
};

export default function Card({ titulo, status, pecasFaltantes = 0 }: CardProps) {
  const statusConvertido = traduzirStatus(status);

  return (
    <div className={Style.card}>
      <h2 className={Style.titulo}>{titulo}</h2>
      <div className={Style.info}>
        <span className={`${Style.status} ${getStatusClass(statusConvertido)}`}>
          {statusConvertido}
        </span>

        {pecasFaltantes > 0 && (
          <span className={Style.pecasFaltantes}>
            Faltam {pecasFaltantes} peças
          </span>
        )}
      </div>
    </div>
  );
}

function traduzirStatus(status: any): string {
  if (!status) return "desconhecido";

  const texto = String(status).toLowerCase();

  switch (texto) {
    case "completed":
      return "concluido";

    case "in_progress":
      return "em andamento";

    case "pending":
      return "nao iniciado";

    default:
      return "desconhecido";
  }
}

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "concluido":
      return Style.concluido;

    case "em andamento":
      return Style.emAndamento;

    case "nao iniciado":
      return Style.naoIniciado;

    default:
      return Style.desconhecido;
  }
}
