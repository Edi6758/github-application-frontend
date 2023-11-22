/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios'
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import Header from '../components/Header'
import { useAuth } from '../hooks/useAuth.ts'

type HistoryItem = {
  id: number;
  createdAt: string;
  username: string;
  status: string;
  foundRepos: number;
};

const formatCreatedAt = (createdAt: string): string => {
  const date = new Date(createdAt);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};


const History: React.FC = () => {
  const { token, user } = useAuth()

  const [history, setHistory] = useState<HistoryItem[]>();

  const getUserHistory = async (user: string) => {
    try {
      const apiResponse = await axios.get(`http://localhost:3000/users/username/${user}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { searchHistoryLog } = apiResponse.data
      setHistory(searchHistoryLog)
    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/search-history-logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Busca removida com sucesso!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Atualizar o estado após a exclusão bem-sucedida
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
    } catch (error) {
      toast.error("Erro ao remover busca.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error('Erro ao excluir item do histórico:', error);
    }
  };

  useEffect(() => {
    getUserHistory(user, token)
  }, [user, token]);

  return (
    <>
      <Header />
      <div className="p-4 lg:max-w-3xl lg:flex lg:flex-col lg:h-[100dvh] lg:justify-start lg:mx-auto lg:relative lg:top-32">
        <h1 className="text-2xl font-bold mb-4">Histórico de Pesquisa</h1>
        {history?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {history?.map(item => (
              <div key={item.id} className="bg-white shadow-md rounded-md p-4">
                <p className="font-semibold">Data e Hora: {formatCreatedAt(item.createdAt)}</p>
                <p>
                  Username: <a href={`/profile/${item.username}`} className="text-blue-500">{item.username}</a>
                </p>
                <p>Status: <span className={item.status == 'found' ? 'text-green-600' : 'text-red-600'}>{item.status == 'found' ? "Sucesso" : "Sem resultados"}</span></p>
                <p>
                  Quantidade de Repositórios: <a href={`/repositories/${item.username}`} className="text-blue-500">{item.foundRepos}</a>
                </p>
                <button
                  className="delete-button bg-red-500 text-white px-2 py-1 rounded mt-2"
                  onClick={() => handleDelete(item.id)}
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>Não há histórico disponível.</p>
            <Link to="/search" className="text-blue-500 mt-4 block">Voltar para a busca</Link>
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default History;
