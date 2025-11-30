'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../component/Navbar";
import Style from "./Testes.module.css";
import axios from "axios";

interface Teste {
  id: number;
  type: string;
  result: string | null;
  aircraftId: number;
  createdAt: string;
  observacoes?: string;
  responsavel?: string;
}

interface CriterioTeste {
  id: string;
  descricao: string;
  verificado: boolean;
}

export default function TestesAeronavePage() {
  const router = useRouter();
  const params = useParams();
  const idNave = params?.id as string;
  
  const [testeAtivo, setTesteAtivo] = useState<Teste | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [testes, setTestes] = useState<Teste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sucesso, setSucesso] = useState('');
  
  const [formData, setFormData] = useState({
    responsavel: '',
    observacoes: '',
    criterios: [] as CriterioTeste[]
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
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
    if (idNave) {
      carregarTestes();
    }
  }, [idNave]);

  const carregarTestes = async () => {
    if (!idNave) {
      setError("ID da aeronave não encontrado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/aeronaves/${idNave}/testes`);
      setTestes(response.data);
    } catch (error: any) {
      console.error("Erro ao carregar testes:", error);
      if (error.response?.status === 404) {
        setError("Rota não encontrada. Verifique se o servidor está rodando corretamente.");
      } else {
        setError(error.response?.data?.error || "Erro ao carregar testes");
      }
    } finally {
      setLoading(false);
    }
  };

  const abrirTeste = (teste: Teste) => {
    setTesteAtivo(teste);
    
    const criterios = getCriteriosPorTipo(teste.type);
    setFormData({
      responsavel: teste.responsavel || '',
      observacoes: teste.observacoes || '',
      criterios
    });
  };

  const fecharTeste = () => {
    setTesteAtivo(null);
    setFormData({
      responsavel: '',
      observacoes: '',
      criterios: []
    });
  };

  const atualizarCriterio = (criterioId: string, verificado: boolean) => {
    setFormData(prev => ({
      ...prev,
      criterios: prev.criterios.map(c => 
        c.id === criterioId ? { ...c, verificado } : c
      )
    }));
  };

  const concluirTeste = async () => {
    if (!testeAtivo) return;

    try {
      const todosCriteriosAtendidos = formData.criterios.every(c => c.verificado);
      const criteriosAtendidos = formData.criterios.filter(c => c.verificado).length;
      const totalCriterios = formData.criterios.length;
      
      if (!formData.responsavel.trim()) {
        setError("Por favor, informe o responsável pelo teste");
        return;
      }

      if (criteriosAtendidos === 0) {
        setError("Pelo menos um critério deve ser verificado");
        return;
      }

      setError('');
      
      await api.put(`/testes/${testeAtivo.id}`, {
        result: todosCriteriosAtendidos ? 'APPROVED' : 'REJECTED',
        responsavel: formData.responsavel,
        observacoes: formData.observacoes
      });

      await carregarTestes();
      setSucesso(`Teste ${todosCriteriosAtendidos ? 'aprovado' : 'reprovado'} com sucesso! (${criteriosAtendidos}/${totalCriterios} critérios atendidos)`);
      fecharTeste();
      
      setTimeout(() => setSucesso(''), 5000);
      
    } catch (error: any) {
      console.error("Erro ao concluir teste:", error);
      setError(error.response?.data?.error || "Erro ao concluir teste");
    }
  };

  const iniciarNovoTeste = async (tipo: string) => {
    if (!idNave) {
      setError("ID da aeronave não encontrado");
      return;
    }

    try {
      setError('');
      await api.post('/testes', {
        type: tipo,
        aircraftId: parseInt(idNave)
      });
      
      setSucesso(`Teste ${traduzirTipoTeste(tipo)} criado com sucesso!`);
      await carregarTestes();
      
      setTimeout(() => setSucesso(''), 5000);
    } catch (error: any) {
      console.error("Erro ao iniciar teste:", error);
      setError(error.response?.data?.error || "Erro ao iniciar teste");
    }
  };

  const excluirTeste = async (testeId: number) => {
    if (!confirm("Tem certeza que deseja excluir este teste?")) {
      return;
    }

    try {
      setError('');
      await api.delete(`/testes/${testeId}`);
      
      setSucesso("Teste excluído com sucesso!");
      await carregarTestes();
      
      setTimeout(() => setSucesso(''), 5000);
    } catch (error: any) {
      console.error("Erro ao excluir teste:", error);
      setError(error.response?.data?.error || "Erro ao excluir teste");
    }
  };

  const getCriteriosPorTipo = (tipo: string): CriterioTeste[] => {
    const criterios: { [key: string]: CriterioTeste[] } = {
      ELECTRICAL: [
        { id: '1', descricao: 'Verificar tensão da bateria (12V - 24V)', verificado: false },
        { id: '2', descricao: 'Testar sistema de carregamento', verificado: false },
        { id: '3', descricao: 'Verificar isolamento elétrico', verificado: false },
        { id: '4', descricao: 'Testar proteções e disjuntores', verificado: false },
        { id: '5', descricao: 'Verificar aterramento do sistema', verificado: false }
      ],
      HYDRAULIC: [
        { id: '1', descricao: 'Verificar pressão do sistema hidráulico', verificado: false },
        { id: '2', descricao: 'Testar vazamentos nos circuitos', verificado: false },
        { id: '3', descricao: 'Verificar funcionamento das bombas', verificado: false },
        { id: '4', descricao: 'Testar válvulas de controle', verificado: false },
        { id: '5', descricao: 'Verificar nível do fluido hidráulico', verificado: false }
      ],
      AERODYNAMIC: [
        { id: '1', descricao: 'Verificar sustentação das asas', verificado: false },
        { id: '2', descricao: 'Testar controle de superfícies', verificado: false },
        { id: '3', descricao: 'Verificar fluxo de ar', verificado: false },
        { id: '4', descricao: 'Testar estabilidade aerodinâmica', verificado: false },
        { id: '5', descricao: 'Verificar pressurização da cabine', verificado: false }
      ]
    };

    return criterios[tipo] || [
      { id: '1', descricao: 'Verificar funcionamento básico', verificado: false }
    ];
  };

  const calcularProgresso = () => {
    const testesConcluidos = testes.filter(t => t.result !== null).length;
    const totalTestes = testes.length;
    return totalTestes > 0 ? Math.round((testesConcluidos / totalTestes) * 100) : 0;
  };

  const testesEletricos = testes.filter(t => t.type === 'ELECTRICAL');
  const testesHidraulicos = testes.filter(t => t.type === 'HYDRAULIC');
  const testesAerodinamicos = testes.filter(t => t.type === 'AERODYNAMIC');

  const traduzirTipoTeste = (tipo: string) => {
    const traducoes: { [key: string]: string } = {
      'ELECTRICAL': 'Elétrico',
      'HYDRAULIC': 'Hidráulico',
      'AERODYNAMIC': 'Aerodinâmico'
    };
    return traducoes[tipo] || tipo;
  };

  const getCorStatus = (result: string | null) => {
    if (result === null) return '#ffa500'; 
    return result === 'APPROVED' ? '#28a745' : '#dc3545';
  };

  const getTextoStatus = (result: string | null) => {
    if (result === null) return ' Pendente';
    return result === 'APPROVED' ? ' Aprovado' : ' Reprovado';
  };

  const podeEditarTestes = () => {
    return userRole === 'ADMIN' || userRole === 'ENGINEER';
  };

  if (loading) {
    return (
      <div className={Style.pagina}>
        <Navbar />
        <div className={Style.conteudo}>
          <div className={Style.loading}>
            <p>Carregando testes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.pagina}>
      <Navbar />

      <div className={Style.conteudo}>
        <div className={Style.header}>
          <button 
            className={Style.botaoVoltar} 
            onClick={() => router.push(`/principal/${idNave}`)}
          >
            ← Voltar para Aeronave
          </button>
          <h1 className={Style.titulo}>Testes: Aeronave XP-{idNave}</h1>
          <p className={Style.subtitulo}>Sistema de testes de qualidade e certificação</p>
        </div>

        {error && (
          <div className={Style.erro}>
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
            <button onClick={carregarTestes} className={Style.botaoRecarregar}>
              Tentar Novamente
            </button>
          </div>
        )}

        {sucesso && (
          <div className={Style.sucesso}>
            <span>{sucesso}</span>
            <button onClick={() => setSucesso('')}>×</button>
          </div>
        )}

        <div className={Style.progressoGeral}>
          <h3>Progresso Geral dos Testes: {calcularProgresso()}%</h3>
          <div className={Style.barraProgresso}>
            <div 
              className={Style.progressoPreenchimento} 
              style={{ width: `${calcularProgresso()}%` }}
            ></div>
          </div>
          <p>{testes.filter(t => t.result !== null).length} de {testes.length} testes concluídos</p>
        </div>

        <div className={Style.etapas}>
          <div className={Style.etapa}>
            <div className={Style.etapaHeader}>
              <h3> Testes Elétricos</h3>
              {podeEditarTestes() && (
                <button
                  className={Style.botaoIniciar}
                  onClick={() => iniciarNovoTeste('ELECTRICAL')}
                >
                  + Novo Teste
                </button>
              )}
            </div>
            <div className={Style.testes}>
              {testesEletricos.length === 0 ? (
                <div className={Style.testeVazio}>
                  <p>Nenhum teste elétrico cadastrado</p>
                </div>
              ) : (
                testesEletricos.map(teste => (
                  <div key={teste.id} className={`${Style.teste} ${teste.result ? Style.testeConcluido : Style.testePendente}`}>
                    <div className={Style.testeHeader}>
                      <h4>Sistema de Energia e Elétrico</h4>
                      {podeEditarTestes() && teste.result === null && (
                        <button
                          className={Style.botaoExcluir}
                          onClick={() => excluirTeste(teste.id)}
                          title="Excluir teste"
                        >
                          X
                        </button>
                      )}
                    </div>
                    <p className={Style.testeStatus} style={{ color: getCorStatus(teste.result) }}>
                      {getTextoStatus(teste.result)}
                    </p>
                    <p className={Style.testeData}>
                      Criado em: {new Date(teste.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    {teste.result === null && podeEditarTestes() && (
                      <button
                        className={Style.botaoRealizar}
                        onClick={() => abrirTeste(teste)}
                      >
                        Realizar Teste
                      </button>
                    )}
                    {teste.result && (
                      <button
                        className={Style.botaoDetalhes}
                        onClick={() => abrirTeste(teste)}
                      >
                        Ver Detalhes
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={Style.etapa}>
            <div className={Style.etapaHeader}>
              <h3> Testes Hidráulicos</h3>
              {podeEditarTestes() && (
                <button
                  className={Style.botaoIniciar}
                  onClick={() => iniciarNovoTeste('HYDRAULIC')}
                >
                  + Novo Teste
                </button>
              )}
            </div>
            <div className={Style.testes}>
              {testesHidraulicos.length === 0 ? (
                <div className={Style.testeVazio}>
                  <p>Nenhum teste hidráulico cadastrado</p>
                </div>
              ) : (
                testesHidraulicos.map(teste => (
                  <div key={teste.id} className={`${Style.teste} ${teste.result ? Style.testeConcluido : Style.testePendente}`}>
                    <div className={Style.testeHeader}>
                      <h4>Sistema Hidráulico</h4>
                      {podeEditarTestes() && teste.result === null && (
                        <button
                          className={Style.botaoExcluir}
                          onClick={() => excluirTeste(teste.id)}
                          title="Excluir teste"
                        >
                          X
                        </button>
                      )}
                    </div>
                    <p className={Style.testeStatus} style={{ color: getCorStatus(teste.result) }}>
                      {getTextoStatus(teste.result)}
                    </p>
                    <p className={Style.testeData}>
                      Criado em: {new Date(teste.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    {teste.result === null && podeEditarTestes() && (
                      <button
                        className={Style.botaoRealizar}
                        onClick={() => abrirTeste(teste)}
                      >
                        Realizar Teste
                      </button>
                    )}
                    {teste.result && (
                      <button
                        className={Style.botaoDetalhes}
                        onClick={() => abrirTeste(teste)}
                      >
                        Ver Detalhes
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={Style.etapa}>
            <div className={Style.etapaHeader}>
              <h3> Testes Aerodinâmicos</h3>
              {podeEditarTestes() && (
                <button
                  className={Style.botaoIniciar}
                  onClick={() => iniciarNovoTeste('AERODYNAMIC')}
                >
                  + Novo Teste
                </button>
              )}
            </div>
            <div className={Style.testes}>
              {testesAerodinamicos.length === 0 ? (
                <div className={Style.testeVazio}>
                  <p>Nenhum teste aerodinâmico cadastrado</p>
                </div>
              ) : (
                testesAerodinamicos.map(teste => (
                  <div key={teste.id} className={`${Style.teste} ${teste.result ? Style.testeConcluido : Style.testePendente}`}>
                    <div className={Style.testeHeader}>
                      <h4>Performance Aerodinâmica</h4>
                      {podeEditarTestes() && teste.result === null && (
                        <button
                          className={Style.botaoExcluir}
                          onClick={() => excluirTeste(teste.id)}
                          title="Excluir teste"
                        >
                          X
                        </button>
                      )}
                    </div>
                    <p className={Style.testeStatus} style={{ color: getCorStatus(teste.result) }}>
                      {getTextoStatus(teste.result)}
                    </p>
                    <p className={Style.testeData}>
                      Criado em: {new Date(teste.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    {teste.result === null && podeEditarTestes() && (
                      <button
                        className={Style.botaoRealizar}
                        onClick={() => abrirTeste(teste)}
                      >
                        Realizar Teste
                      </button>
                    )}
                    {teste.result && (
                      <button
                        className={Style.botaoDetalhes}
                        onClick={() => abrirTeste(teste)}
                      >
                        Ver Detalhes
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {testeAtivo && (
          <div className={Style.modalOverlay}>
            <div className={Style.modal}>
              <div className={Style.modalHeader}>
                <h2>Teste {traduzirTipoTeste(testeAtivo.type)}</h2>
                <button className={Style.botaoFecharModal} onClick={fecharTeste}>×</button>
              </div>
              
              <p className={Style.modalInfo}>
                ID: {testeAtivo.id} | Criado em: {new Date(testeAtivo.createdAt).toLocaleDateString('pt-BR')}
                {testeAtivo.result && (
                  <span className={Style.statusModal} style={{ color: getCorStatus(testeAtivo.result) }}>
                    | Status: {getTextoStatus(testeAtivo.result)}
                  </span>
                )}
              </p>

              <div className={Style.criterios}>
                <h4>Critérios de Aprovação:</h4>
                {formData.criterios.map(criterio => (
                  <label key={criterio.id} className={Style.criterioItem}>
                    <input 
                      type="checkbox" 
                      checked={criterio.verificado}
                      onChange={(e) => atualizarCriterio(criterio.id, e.target.checked)}
                      disabled={testeAtivo.result !== null}
                    />
                    <span className={criterio.verificado ? Style.criterioAtendido : Style.criterioNaoAtendido}>
                      {criterio.descricao}
                    </span>
                  </label>
                ))}
                <div className={Style.resumoCriterios}>
                  {formData.criterios.filter(c => c.verificado).length} de {formData.criterios.length} critérios atendidos
                </div>
              </div>

              <div className={Style.formTeste}>
                <div className={Style.campo}>
                  <label>Responsável pelo teste:</label>
                  <input
                    type="text"
                    placeholder="Nome do responsável"
                    className={Style.input}
                    value={formData.responsavel}
                    onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                    disabled={testeAtivo.result !== null}
                  />
                </div>
                <div className={Style.campo}>
                  <label>Observações:</label>
                  <textarea
                    placeholder="Anotações, observações e detalhes do teste..."
                    className={Style.textarea}
                    rows={4}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    disabled={testeAtivo.result !== null}
                  />
                </div>
              </div>

              <div className={Style.acoesModal}>
                {testeAtivo.result === null ? (
                  <>
                    <button 
                      className={Style.botaoConcluir}
                      onClick={concluirTeste}
                      disabled={!formData.responsavel.trim() || formData.criterios.filter(c => c.verificado).length === 0}
                    >
                      {formData.criterios.every(c => c.verificado) ? ' Aprovar Teste' : ' Concluir Teste'}
                    </button>
                    <button className={Style.botaoCancelar} onClick={fecharTeste}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button className={Style.botaoFechar} onClick={fecharTeste}>
                    Fechar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}