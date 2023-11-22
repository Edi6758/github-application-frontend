import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string;
}

const Repositories: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const { token } = useAuth();
  const tokenString = token !== null ? token : '';

  const [repositories, setRepositories] = useState<Repository[]>([])

  const fetchRepositories = async (username: string, accessToken: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/repos/${username}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Os dados dos repositórios estão disponíveis em response.data
      setRepositories(response.data.data)
    } catch (error) {
      // Trate os erros aqui
      console.error('Erro ao buscar repositórios:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!username) return;
    fetchRepositories(username, tokenString)
  }, [tokenString, username]);

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
          <h2 className="text-3xl font-semibold mb-6">Repositórios</h2>
          <div className="mb-6">
            <p>
              <span className="text-blue-600 cursor-pointer underline" onClick={() => navigate(`/profile/${username}`)}>
                {username}
              </span>{' '}
              - Total de repositórios encontrados: {repositories.length}
            </p>
          </div>
          <div className="mb-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => navigate('/search')}
            >
              Buscar novamente
            </button>
          </div>
          <div className="w-full">
            {repositories.map((repo: Repository) => (
              <div key={repo.id} className="border-b border-gray-300 mb-4 pb-4">
                <h3 className="text-xl font-semibold mb-2">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    {repo.name}
                  </a>
                </h3>
                {repo.description ? (
                  <p className="mb-2">{repo.description}</p>
                ) : (
                  <p className="italic text-gray-500 mb-2">Nenhuma descrição disponível</p>
                )}
                <p className="text-gray-600">Linguagem: {repo.language}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Repositories;
