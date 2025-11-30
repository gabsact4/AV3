'use client';

import Navbar from "../component/Navbar";
import Card from "../Card";
import Style from "../Menu.module.css";
import StyleButton from "./AeroNave.module.css";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

interface Aeronave {
  id: number;
  code: string;
  model: string;
  type: string;
  capacity: number;
  range: number;
  status: string;
}

interface Usuario {
  id: number;
  name: string;
  role: string;
}

export default function Detalhes() {
  const router = useRouter();
  const params = useParams();
  const naveId = params?.id as string;
  
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [aeronave, setAeronave] = useState<Aeronave | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    const name = localStorage.getItem('userName') || '';
    setUserRole(role);
    setUserName(name);
    
    if (naveId) {
      carregarDados();
    }
  }, [naveId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [aeronavesResponse, usuariosResponse] = await Promise.all([
        api.get('/aeronaves'),
        api.get('/funcionarios')
      ]);
      
      const aeronaveEncontrada = aeronavesResponse.data.find(
        (a: Aeronave) => a.id === parseInt(naveId)
      );
      
      if (aeronaveEncontrada) {
        setAeronave(aeronaveEncontrada);
      } else {
        setError('Aeronave não encontrada');
      }
      
      setUsuarios(usuariosResponse.data);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      setError(error.response?.data?.error || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Obter status atual da aeronave
  const getStatusAeronave = () => {
    if (!aeronave) return 'Carregando...';
    
    // Lógica para determinar o status baseado nos testes e etapas
    // Você pode adaptar isso conforme sua lógica de negócio
    return 'Teste Elétrico';
  };

  // Obter etapa atual
  const getEtapaAtual = () => {
    // Lógica para determinar a etapa atual
    // Você pode adaptar isso conforme sua lógica de negócio
    return '2 de 5';
  };

  // Obter responsável atual
  const getResponsavelAtual = () => {
    // Lógica para obter o responsável atual
    // Você pode adaptar isso conforme sua lógica de negócio
    return 'João Silva';
  };

  if (loading) {
    return (
      <div className={Style.pagina}>
        <Navbar />
        <div className={Style.conteudo}>
          <div className={StyleButton.loading}>
            <p>Carregando detalhes da aeronave...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.pagina}>
      <Navbar />

      <div className={Style.conteudo}>
        <div className={StyleButton.page}>
          
          {error && (
            <div className={StyleButton.erro}>
              <span>{error}</span>
              <button onClick={() => setError('')}>×</button>
            </div>
          )}

          {(userRole === 'ADMIN' || userRole === 'ENGINEER') && (
            <div className={StyleButton.selecaoResponsavel}>
              <label htmlFor="responsavel" className={StyleButton.label}>
                Selecione o Responsável:
              </label>
              <select
                id="responsavel"
                value={responsavelSelecionado}
                onChange={(e) => setResponsavelSelecionado(e.target.value)}
                className={StyleButton.select}
              >
                <option value="">Selecione um responsável</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.name} - {usuario.role}
                  </option>
                ))}
              </select>

              <div className={StyleButton.responsavelAtual}>
                <strong>Responsável atual:</strong> {getResponsavelAtual()}
              </div>
            </div>
          )}

          <div className={StyleButton.cardContainer}>
            <Card 
              titulo={`Aeronave ${aeronave?.code || 'XP-01'}`} 
              status={getStatusAeronave()} 
            />
          </div>

          <div className={StyleButton.gridBotoes}>
            <button 
              className={StyleButton.button} 
              onClick={() => router.push(`/principal/${naveId}/pecas`)}
            >
              Gerenciar Peças
            </button>
            
            <button 
              className={StyleButton.button} 
              onClick={() => router.push(`/principal/${naveId}/teste`)}
            >
              Testes
            </button>

            <button 
              className={StyleButton.button} 
              onClick={() => router.push(`/principal/${naveId}/Etapas`)}
            >
              Gerenciar Etapas
            </button>
            
          </div>

          <div className={StyleButton.infoContainer}>
            <h3 className={StyleButton.infoTitulo}>
              Informações da Aeronave
            </h3>
            
            <div className={StyleButton.infoGrid}>
              <div className={StyleButton.infoColuna}>
                <p>
                  <strong>ID:</strong> {naveId}
                </p>
                <p>
                  <strong>Modelo:</strong> {aeronave?.model || 'Não disponível'}
                </p>
                <p>
                  <strong>Tipo:</strong> {aeronave?.type || 'Não disponível'}
                </p>
                <p>
                  <strong>Capacidade:</strong> {aeronave?.capacity || 'N/A'}
                </p>
              </div>
              
              <div className={StyleButton.infoColuna}>
                <p>
                  <strong>Status:</strong>
                  <span className={StyleButton.statusTexto}>
                    {getStatusAeronave()}
                  </span>
                </p>
                <p>
                  <strong>Etapa Atual:</strong> {getEtapaAtual()}
                </p>
                <p>
                  <strong>Responsável:</strong> {getResponsavelAtual()}
                </p>
                <p>
                  <strong>Usuário Logado:</strong> {userName} ({userRole})
                </p>
              </div>
            </div>

            {aeronave && (
              <div className={StyleButton.infoAdicional}>
                <h4>Detalhes Técnicos</h4>
                <div className={StyleButton.infoGrid}>
                  <div className={StyleButton.infoColuna}>
                    <p><strong>Código:</strong> {aeronave.code}</p>
                    <p><strong>Alcance:</strong> {aeronave.range} km</p>
                  </div>
                  <div className={StyleButton.infoColuna}>
                    <p><strong>Capacidade:</strong> {aeronave.capacity} passageiros</p>
                    <p><strong>Tipo:</strong> {aeronave.type}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}