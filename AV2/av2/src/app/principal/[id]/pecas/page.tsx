"use client";

import Navbar from "../../component/Navbar";
import Style from "./Pecas.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Peca {
  id: number;
  nome: string;
  quantidadeTotal: number;
  quantidadeInstalada: number;
  categoria: string;
  localizacao: string;
  status: "Completo" | "Faltante";
}

interface NovaPeca {
  nome: string;
  quantidadeTotal: number;
  categoria: string;
  localizacao: string;
  tipo: "NACIONAL" | "IMPORTADA";
  supplier: string;
}

export default function PecasAeronavePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [novaPeca, setNovaPeca] = useState<NovaPeca>({
    nome: "",
    quantidadeTotal: 1,
    categoria: "",
    localizacao: "Almoxarifado",
    tipo: "NACIONAL",
    supplier: "Fornecedor Padrão"
  });

  const api = axios.create({
    baseURL: "http://localhost:3001/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);
    carregarPecas();
  }, []);

  const carregarPecas = async () => {
    try {
      setLoading(true);
      const response = await api.get("/pecas");
      setPecas(response.data);
    } catch (error) {
      console.error("Erro ao carregar peças:", error);
      setError("Erro ao carregar peças");
    } finally {
      setLoading(false);
    }
  };

  const adicionarPeca = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/pecas", {
        name: novaPeca.nome,
        type: novaPeca.tipo,
        supplier: novaPeca.supplier,
        status: "IN_PRODUCTION",
        quantidadeTotal: novaPeca.quantidadeTotal,
        categoria: novaPeca.categoria,
        localizacao: novaPeca.localizacao
      });

      setNovaPeca({
        nome: "",
        quantidadeTotal: 1,
        categoria: "",
        localizacao: "Almoxarifado",
        tipo: "NACIONAL",
        supplier: "Fornecedor Padrão"
      });

      carregarPecas();
    } catch (error) {
      console.error("Erro ao adicionar peça:", error);
      setError("Erro ao adicionar peça");
    }
  };

  const marcarInstalada = async (id: number) => {
    try {
      await api.put(`/pecas/${id}`, {
        status: "READY"
      });
      carregarPecas();
    } catch (error) {
      console.error("Erro ao marcar peça como instalada:", error);
      setError("Erro ao atualizar peça");
    }
  };

  const removerPeca = async (id: number) => {
    try {
      await api.delete(`/pecas/${id}`);
      carregarPecas();
    } catch (error) {
      console.error("Erro ao remover peça:", error);
      setError("Erro ao remover peça");
    }
  };

  const gerarRelatorio = async () => {
    try {
      const response = await api.get("/pecas/relatorio");
      console.log("Relatório gerado:", response.data);
      alert("Relatório gerado com sucesso! Verifique o console.");
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setError("Erro ao gerar relatório");
    }
  };

  const gerarPDF = async () => {
    try {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = '-9999px';
      div.style.width = '210mm';
      div.style.padding = '20px';
      div.style.backgroundColor = 'white';
      div.style.fontFamily = 'Arial, sans-serif';
      div.style.color = '#333';
      
      const totalPecas = pecas.length;
      const pecasCompletas = pecas.filter(p => p.status === "Completo").length;
      const pecasFaltantes = pecas.filter(p => p.status === "Faltante").length;
      const percentualCompleto = totalPecas > 0 ? Math.round((pecasCompletas / totalPecas) * 100) : 0;

      div.innerHTML = `
        <div id="relatorio-content" style="max-width: 100%;">
          <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">RELATÓRIO DE PEÇAS - AERONAVE XP-01</h1>
            <p style="color: #7f8c8d; margin: 5px 0;">Data de Geração: ${new Date().toLocaleString()}</p>
            <p style="color: #7f8c8d; margin: 0;">Sistema de Gestão Aeronáutica</p>
          </div>

          <div style="margin-bottom: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
            <h2 style="color: #34495e; margin-top: 0; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px;">Resumo Executivo</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
              <div>
                <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${percentualCompleto}%</div>
                <div style="font-size: 12px; color: #7f8c8d;">Progresso Geral</div>
              </div>
              <div>
                <div style="font-size: 18px; font-weight: bold; color: #2980b9;">${totalPecas} Peças</div>
                <div style="font-size: 12px; color: #7f8c8d;">Total no Sistema</div>
              </div>
              <div>
                <div style="font-size: 14px; color: #27ae60;">${pecasCompletas} Concluídas</div>
                <div style="font-size: 14px; color: #e74c3c;">${pecasFaltantes} Faltantes</div>
              </div>
            </div>
          </div>

          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px;">Estatísticas Detalhadas</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
                <h3 style="color: #e74c3c; margin: 0 0 10px 0; text-align: center;"> Estatísticas Gerais</h3>
                <div style="font-size: 12px;">
                  <div>Total de Peças: <strong>${totalPecas}</strong></div>
                  <div>Peças Completas: <strong style="color: #27ae60;">${pecasCompletas}</strong></div>
                  <div>Peças Faltantes: <strong style="color: #e74c3c;">${pecasFaltantes}</strong></div>
                  <div>Taxa de Conclusão: <strong>${percentualCompleto}%</strong></div>
                </div>
              </div>
              <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
                <h3 style="color: #3498db; margin: 0 0 10px 0; text-align: center;"> Distribuição</h3>
                <div style="font-size: 12px;">
                  <div>Por Categoria: <strong>${[...new Set(pecas.map(p => p.categoria))].length} categorias</strong></div>
                  <div>Por Localização: <strong>${[...new Set(pecas.map(p => p.localizacao))].length} locais</strong></div>
                  <div>Última Atualização: <strong>${new Date().toLocaleDateString()}</strong></div>
                </div>
              </div>
            </div>
          </div>

          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px;">Lista Completa de Peças (${pecas.length})</h2>
            <div style="font-size: 10px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #34495e; color: white;">
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nome</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Categoria</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Localização</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Quantidade</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${pecas.map((peca, index) => `
                    <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                      <td style="padding: 6px; border: 1px solid #ddd;">${peca.nome}</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${peca.categoria}</td>
                      <td style="padding: 6px; border: 1px solid #ddd;">${peca.localizacao}</td>
                      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${peca.quantidadeInstalada}/${peca.quantidadeTotal}</td>
                      <td style="padding: 6px; border: 1px solid #ddd; text-align: center; color: ${peca.status === "Completo" ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                        ${peca.status}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px;">Análise por Categoria</h2>
            <div style="font-size: 11px;">
              ${(() => {
                const categorias = pecas.reduce((acc, peca) => {
                  if (!acc[peca.categoria]) {
                    acc[peca.categoria] = { total: 0, completas: 0 };
                  }
                  acc[peca.categoria].total++;
                  if (peca.status === "Completo") acc[peca.categoria].completas++;
                  return acc;
                }, {} as any);

                return Object.entries(categorias).map(([categoria, dados]: [string, any]) => `
                  <div style="margin-bottom: 8px; padding: 5px; border-left: 4px solid #3498db;">
                    <strong>${categoria}:</strong> ${dados.completas}/${dados.total} completas 
                    (${dados.total > 0 ? Math.round((dados.completas / dados.total) * 100) : 0}%)
                  </div>
                `).join('');
              })()}
            </div>
          </div>

          <div style="border-top: 2px solid #333; padding-top: 10px; text-align: center; color: #7f8c8d; font-size: 10px;">
            <p>Relatório gerado automaticamente pelo Sistema de Gestão Aeronáutica</p>
            <p>Documento confidencial - Uso interno</p>
            <p>Página 1 de 1</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(div);

      const canvas = await html2canvas(div, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(div);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-pecas-aeronave-XP-01-${new Date().toISOString().split('T')[0]}.pdf`);


    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      setError("Erro ao gerar PDF");
    }
  };

  const pecasFiltradas = pecas.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busca.toLowerCase()) ||
      p.localizacao.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return (
      <div className={Style.pagina}>
        <Navbar />
        <div className={Style.conteudo}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.pagina}>
      <Navbar />

      <div className={Style.botoesTopo}>
        {userRole === "ADMIN" && (
          <button
            className={Style.botaoTeste}
            onClick={() => router.push("/principal/1/teste")}
          >
            Ir para Testes
          </button>
        )}
        <button className={Style.botaoRelatorio} onClick={gerarPDF} style={{backgroundColor: '#24949c', marginLeft: '10px'}}>
           Gerar PDF
        </button>
      </div>

      <div className={Style.conteudo}>
        <div className={Style.header}>
          <button className={Style.botaoVoltar} onClick={() => router.back()}>
            ← Voltar
          </button>
          <h1 className={Style.titulo}>Peças da Aeronave: XP-01</h1>
        </div>

        {error && (
          <div className={Style.erro}>
            {error}
            <button onClick={() => setError("")}>X</button>
          </div>
        )}

        <div className={Style.formContainer}>
          <h2>Adicionar Nova Peça</h2>
          <form onSubmit={adicionarPeca} className={Style.form}>
            <input 
              type="text" 
              placeholder="Nome da peça" 
              className={Style.input} 
              value={novaPeca.nome}
              onChange={(e) => setNovaPeca({...novaPeca, nome: e.target.value})}
              required
            />
            <input 
              type="number" 
              placeholder="Quantidade necessária" 
              className={Style.input} 
              min="1" 
              value={novaPeca.quantidadeTotal}
              onChange={(e) => setNovaPeca({...novaPeca, quantidadeTotal: parseInt(e.target.value)})}
              required
            />
            <input 
              type="text" 
              placeholder="Categoria" 
              className={Style.input} 
              value={novaPeca.categoria}
              onChange={(e) => setNovaPeca({...novaPeca, categoria: e.target.value})}
              required
            />
            <input 
              type="text" 
              placeholder="Fornecedor" 
              className={Style.input} 
              value={novaPeca.supplier}
              onChange={(e) => setNovaPeca({...novaPeca, supplier: e.target.value})}
              required
            />
            <select 
              className={Style.input}
              value={novaPeca.localizacao}
              onChange={(e) => setNovaPeca({...novaPeca, localizacao: e.target.value})}
            >
              <option value="Almoxarifado">Almoxarifado</option>
              <option value="Oficina">Oficina</option>
              <option value="Hangar">Hangar</option>
              <option value="Externo">Externo</option>
            </select>
            <select 
              className={Style.input}
              value={novaPeca.tipo}
              onChange={(e) => setNovaPeca({...novaPeca, tipo: e.target.value as "NACIONAL" | "IMPORTADA"})}
            >
              <option value="NACIONAL">Nacional</option>
              <option value="IMPORTADA">Importada</option>
            </select>
            <button type="submit" className={Style.botaoAdicionar}>
              Adicionar Peça
            </button>
          </form>
        </div>

        <div className={Style.buscaContainer}>
          <input
            type="text"
            placeholder="Buscar peças..."
            className={Style.inputBusca}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className={Style.listaPecas}>
          <h2>Peças da Aeronave ({pecasFiltradas.length})</h2>
          <div className={Style.gridPecas}>
            {pecasFiltradas.map((p) => (
              <div
                key={p.id}
                className={`${Style.cardPeca} ${p.status === "Completo" ? Style.completa : Style.faltante}`}
              >
                <h3>{p.nome}</h3>
                <div className={Style.infoPeca}>
                  <p><strong>Categoria:</strong> {p.categoria}</p>
                  <p><strong>Localização:</strong> {p.localizacao}</p>
                  <p>
                    <strong>Quantidade:</strong> {p.quantidadeInstalada} / {p.quantidadeTotal}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${Style.status} ${
                        p.status === "Completo" ? Style.statusCompleto : Style.statusFaltante
                      }`}
                    >
                      {p.status}
                    </span>
                  </p>
                </div>
                {(userRole === "ADMIN" || userRole === "ENGINEER") && (
                  <div className={Style.acoes}>
                    {p.status !== "Completo" && (
                      <button className={Style.botaoInstalar} onClick={() => marcarInstalada(p.id)}>
                        Marcar como Instalada
                      </button>
                    )}
                    <button className={Style.botaoRemover} onClick={() => removerPeca(p.id)}>
                      Remover
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}