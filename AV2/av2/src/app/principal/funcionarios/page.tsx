'use client';

import Navbar from "../component/Navbar";
import Style from "./Funcionario.module.css";
import { useEffect, useState } from "react";
import axios from "axios";

interface Funcionario {
  id: number;
  name: string;
  role: string;
  username: string;
  phone: string;
  address: string;
  password?: string;
}

export default function Funcionario() {
  const [userRole, setUserRole] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState<Funcionario | null>(null);

  const [novoFuncionario, setNovoFuncionario] = useState({
    name: "",
    role: "",
    username: "",
    phone: "",
    address: "",
    password: ""
  });

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);

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
    carregarFuncionarios();
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
  }, []);

  const carregarFuncionarios = async () => {
    try {
      setLoading(true);
      const resposta = await api.get("/funcionarios");
      setFuncionarios(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      alert("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  const funcionariosFiltrados = funcionarios.filter((f: any) =>
    f.name?.toLowerCase().includes(busca.toLowerCase()) ||
    f.username?.toLowerCase().includes(busca.toLowerCase()) ||
    f.role?.toLowerCase().includes(busca.toLowerCase())
  );

  const handleCadastrar = async () => {
    if (!novoFuncionario.name || !novoFuncionario.role || !novoFuncionario.username || !novoFuncionario.password) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      if (editando && funcionarioEditando) {
        await api.put(`/usuarios/${funcionarioEditando.id}`, {
          name: novoFuncionario.name,
          role: novoFuncionario.role,
          username: novoFuncionario.username,
          phone: novoFuncionario.phone,
          address: novoFuncionario.address,
          password: novoFuncionario.password || undefined 
        });
        alert("Funcionário atualizado com sucesso!");
      } else {
        await api.post("/usuarios", {
          name: novoFuncionario.name,
          role: novoFuncionario.role,
          username: novoFuncionario.username,
          phone: novoFuncionario.phone,
          address: novoFuncionario.address,
          password: novoFuncionario.password
        });
        alert("Funcionário cadastrado com sucesso!");
      }

      await carregarFuncionarios();
      fecharModal();
      
    } catch (error: any) {
      console.error("Erro ao salvar funcionário:", error);
      alert(error.response?.data?.error || "Erro ao salvar funcionário");
    }
  };

  const handleEditar = (funcionario: Funcionario) => {
    setEditando(true);
    setFuncionarioEditando(funcionario);
    setNovoFuncionario({
      name: funcionario.name,
      role: funcionario.role,
      username: funcionario.username,
      phone: funcionario.phone || "",
      address: funcionario.address || "",
      password: "" // Senha em branco para edição
    });
    setShowModal(true);
  };

  const handleExcluir = async (funcionario: Funcionario) => {
    if (!confirm(`Tem certeza que deseja excluir o funcionário ${funcionario.name}?`)) {
      return;
    }

    try {
      await api.delete(`/usuarios/${funcionario.id}`);
      alert("Funcionário excluído com sucesso!");
      await carregarFuncionarios();
    } catch (error: any) {
      console.error("Erro ao excluir funcionário:", error);
      alert(error.response?.data?.error || "Erro ao excluir funcionário");
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditando(false);
    setFuncionarioEditando(null);
    setNovoFuncionario({
      name: "",
      role: "",
      username: "",
      phone: "",
      address: "",
      password: ""
    });
  };

  const traduzirCargo = (role: string) => {
    const traducoes: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'ENGINEER': 'Engenheiro',
      'OPERATOR': 'Operador'
    };
    return traducoes[role] || role;
  };

  return (
    <div className={Style.pagina}>
      <Navbar />

      <div className={Style.conteudo}>
        <div className={Style.header}>
          <input
            className={Style.input}
            type="text"
            placeholder="Buscar nome, cargo ou usuário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {userRole === 'ADMIN' && (
            <button className={Style.addButton} onClick={() => setShowModal(true)}>
              <span>+</span>
              Cadastrar Funcionário
            </button>
          )}
        </div>

        {loading && (
          <div className={Style.loading}>Carregando funcionários...</div>
        )}

        <div className={Style.tabelaContainer}>
          {funcionariosFiltrados.length > 0 ? (
            <table className={Style.tabela}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Usuário</th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                  {userRole === 'ADMIN' && <th>Ações</th>}
                </tr>
              </thead>

              <tbody>
                {funcionariosFiltrados.map((f: any) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.name}</td>
                    <td>{traduzirCargo(f.role)}</td>
                    <td>{f.username}</td>
                    <td>{f.phone || "—"}</td>
                    <td>{f.address || "—"}</td>

                    {userRole === 'ADMIN' && (
                      <td>
                        <div className={Style.acoes}>
                          <button 
                            className={`${Style.acaoButton} ${Style.editar}`}
                            onClick={() => handleEditar(f)}
                          >
                            Editar
                          </button>
                          <button 
                            className={`${Style.acaoButton} ${Style.excluir}`}
                            onClick={() => handleExcluir(f)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && (
              <div className={Style.semResultados}>
                {busca ? "Nenhum funcionário encontrado." : "Nenhum funcionário cadastrado."}
              </div>
            )
          )}
        </div>
      </div>

      {showModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>{editando ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</h2>

            <div className={Style.formGroup}>
              <label>Nome *</label>
              <input
                type="text"
                value={novoFuncionario.name}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div className={Style.formGroup}>
              <label>Cargo *</label>
              <select
                value={novoFuncionario.role}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, role: e.target.value })}
              >
                <option value="">Selecione um cargo</option>
                <option value="ADMIN">Administrador</option>
                <option value="ENGINEER">Engenheiro</option>
                <option value="OPERATOR">Operador</option>
              </select>
            </div>

            <div className={Style.formGroup}>
              <label>Usuário *</label>
              <input
                type="text"
                value={novoFuncionario.username}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, username: e.target.value })}
                placeholder="Nome de usuário para login"
              />
            </div>

            <div className={Style.formGroup}>
              <label>
                {editando ? 'Nova Senha (deixe em branco para manter atual)' : 'Senha *'}
              </label>
              <input
                type="password"
                value={novoFuncionario.password}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, password: e.target.value })}
                placeholder={editando ? "Nova senha (opcional)" : "Senha para login"}
              />
            </div>

            <div className={Style.formGroup}>
              <label>Telefone</label>
              <input
                type="text"
                value={novoFuncionario.phone}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className={Style.formGroup}>
              <label>Endereço</label>
              <input
                type="text"
                value={novoFuncionario.address}
                onChange={(e) => setNovoFuncionario({ ...novoFuncionario, address: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>

            <div className={Style.modalButtons}>
              <button onClick={handleCadastrar} className={Style.salvar}>
                {editando ? 'Atualizar' : 'Cadastrar'}
              </button>
              <button onClick={fecharModal} className={Style.cancelar}>
                Cancelar
              </button>
            </div>

            <div className={Style.obrigatorio}>
              * Campos obrigatórios
            </div>
          </div>
        </div>
      )}
    </div>
  );
}