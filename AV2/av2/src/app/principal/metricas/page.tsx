'use client';

import { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import axios from "axios";

interface MetricasDesempenho {
  singleUser: any;
  fiveUsers: any;
  tenUsers: any;
}

interface RelatorioQualidade {
  titulo: string;
  dataGeracao: string;
  estatisticasSistema: any;
  metricasDesempenho: MetricasDesempenho;
  graficos: any;
  analiseQualidade: any;
  conformidadeCritica: any;
}

export default function MetricasPage() {
  const [relatorio, setRelatorio] = useState<RelatorioQualidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [testando, setTestando] = useState(false);
  const [erro, setErro] = useState('');

  const api = axios.create({
    baseURL: "http://localhost:3001/api",
  });

  useEffect(() => {
    carregarRelatorio();
  }, []);

  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      setErro('');
      const response = await api.get("/relatorio-qualidade");
      setRelatorio(response.data);
    } catch (error: any) {
      console.error("Erro ao carregar relatório:", error);
      setErro(`Erro: ${error.response?.status} - ${error.response?.data?.error || 'Servidor não respondeu'}`);
    } finally {
      setLoading(false);
    }
  };

  const executarTesteCarga = async (usuarios: number) => {
    try {
      setTestando(true);
      setErro('');
      
      await api.post("/metrics/teste-carga", {
        userCount: usuarios,
        requestsPerUser: 15
      });
      
      await carregarRelatorio();
      alert(`Teste com ${usuarios} usuários concluído!`);
    } catch (error: any) {
      console.error("Erro no teste:", error);
      setErro(`Erro no teste: ${error.response?.status} - ${error.response?.data?.error || 'Servidor não respondeu'}`);
    } finally {
      setTestando(false);
    }
  };

  const testarConexao = async () => {
    try {
      const response = await api.get("/health");
      console.log("Conexão OK:", response.data);
      return true;
    } catch (error) {
      console.error("Servidor offline:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Carregando relatório de qualidade...</p>
          <p style={{ fontSize: '14px', color: '#666' }}>Verificando conexão com o servidor</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>Relatório de Qualidade do Sistema</h1>
          <p style={{ color: '#666' }}>Sistema Crítico - Produção de Aeronaves</p>
        </div>

        {erro && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #e74c3c',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: '#c0392b'
          }}>
            <strong>Erro:</strong> {erro}
            <div style={{ marginTop: '10px' }}>
              <button 
                onClick={testarConexao}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Testar Conexão
              </button>
              <button 
                onClick={carregarRelatorio}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {[1, 5, 10].map(usuarios => (
            <button
              key={usuarios}
              onClick={() => executarTesteCarga(usuarios)}
              disabled={testando}
              style={{
                padding: '12px 24px',
                backgroundColor: 
                  usuarios === 1 ? '#007acc' : 
                  usuarios === 5 ? '#009688' : '#ff5722',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: testando ? 'not-allowed' : 'pointer',
                opacity: testando ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {testando ? ' Testando...' : ` Testar ${usuarios} Usuário${usuarios > 1 ? 's' : ''}`}
            </button>
          ))}
        </div>

        {!relatorio && !erro && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            <p>Nenhum relatório disponível</p>
            <button 
              onClick={carregarRelatorio}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Carregar Relatório
            </button>
          </div>
        )}

        {relatorio && (
          <>
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '30px',
              backgroundColor: '#fafafa'
            }}>
              <h2> Estatísticas do Sistema</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {Object.entries(relatorio.estatisticasSistema).map(([key, value]) => (
                  <div key={key} style={{ 
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: '#2c3e50'
                    }}>
                      {typeof value === 'number' ? value : String(value)}
                    </div>
                    <div style={{ 
                      color: '#7f8c8d', 
                      fontSize: '14px',
                      marginTop: '5px'
                    }}>
                      {key.replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .replace('Aeronaves Com Testes Pendentes', 'Aeronaves Pendentes')
                          .replace('Taxa Conclusao Testes', 'Conclusão Testes')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h2> Métricas de Desempenho (milissegundos)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {Object.entries(relatorio.graficos.tempoResposta).map(([cenario, dados]) => (
                  <div key={cenario} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ 
                      marginTop: 0, 
                      textAlign: 'center',
                      color: '#2c3e50',
                      fontSize: '18px'
                    }}>
                      {cenario === 'singleUser' ? ' 1 Usuário' : 
                       cenario === 'fiveUsers' ? ' 5 Usuários' : ' 10 Usuários'}
                    </h3>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#e74c3c' }}>
                         Tempo de Resposta
                      </h4>
                      <div style={{ height: '80px', display: 'flex', alignItems: 'end', gap: '4px' }}>
                        {(dados as number[]).map((valor, index) => (
                          <div
                            key={index}
                            style={{
                              flex: 1,
                              backgroundColor: '#e74c3c',
                              height: `${Math.min(valor / 3, 100)}%`,
                              minHeight: '8px',
                              borderRadius: '3px',
                              transition: 'height 0.3s ease'
                            }}
                            title={`${valor}ms`}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                        Média: {Math.round((dados as number[]).reduce((a, b) => a + b, 0) / (dados as number[]).length)}ms
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#3498db' }}>
                         Latência
                      </h4>
                      <div style={{ height: '80px', display: 'flex', alignItems: 'end', gap: '4px' }}>
                        {relatorio.graficos.latencia[cenario].map((valor: number, index: number) => (
                          <div
                            key={index}
                            style={{
                              flex: 1,
                              backgroundColor: '#3498db',
                              height: `${Math.min(valor * 4, 100)}%`,
                              minHeight: '8px',
                              borderRadius: '3px',
                              transition: 'height 0.3s ease'
                            }}
                            title={`${valor}ms`}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                        Média: {Math.round(relatorio.graficos.latencia[cenario].reduce((a: number, b: number) => a + b, 0) / relatorio.graficos.latencia[cenario].length)}ms
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#2ecc71' }}>
                         Processamento
                      </h4>
                      <div style={{ height: '80px', display: 'flex', alignItems: 'end', gap: '4px' }}>
                        {relatorio.graficos.processamento[cenario].map((valor: number, index: number) => (
                          <div
                            key={index}
                            style={{
                              flex: 1,
                              backgroundColor: '#2ecc71',
                              height: `${Math.min(valor / 3, 100)}%`,
                              minHeight: '8px',
                              borderRadius: '3px',
                              transition: 'height 0.3s ease'
                            }}
                            title={`${valor}ms`}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                        Média: {Math.round(relatorio.graficos.processamento[cenario].reduce((a: number, b: number) => a + b, 0) / relatorio.graficos.processamento[cenario].length)}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              border: '2px solid #2ecc71',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '30px',
              backgroundColor: '#f0fff4'
            }}>
              <h2 style={{ color: '#27ae60', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 Análise de Qualidade
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {Object.entries(relatorio.analiseQualidade).map(([key, value]) => (
                  <div key={key} style={{ 
                    textAlign: 'center',
                    padding: '15px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #2ecc71'
                  }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: '#27ae60'
                    }}>
                      {String(value)}
                    </div>
                    <div style={{ 
                      color: '#7f8c8d', 
                      fontSize: '12px',
                      marginTop: '5px'
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              border: '2px solid #e74c3c',
              borderRadius: '10px',
              padding: '20px',
              backgroundColor: '#fff5f5'
            }}>
              <h2 style={{ color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 Sistema Crítico - Produção de Aeronaves
              </h2>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Nível de Criticidade:</strong> {relatorio.conformidadeCritica.nivel}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Normas Atendidas:</strong>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                  {relatorio.conformidadeCritica.normasAtendidas.map((norma: string, index: number) => (
                    <li key={index} style={{ marginBottom: '5px' }}> {norma}</li>
                  ))}
                </ul>
              </div>
              
              <div style={{ 
                padding: '15px',
                backgroundColor: '#ffebee',
                borderRadius: '5px',
                border: '1px solid #e74c3c',
                marginTop: '15px'
              }}>
                <strong>Certificação:</strong> {relatorio.conformidadeCritica.certificacoes}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}