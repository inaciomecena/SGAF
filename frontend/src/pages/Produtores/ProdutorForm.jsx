import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, User, MapPin } from 'lucide-react';
import produtorService from '../../services/produtorService';

const onlyDigits = (value) => value.replace(/\D/g, '');

const formatCep = (value) => {
  const raw = onlyDigits(value).slice(0, 8);
  if (raw.length <= 5) return raw;
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
};

export default function ProdutorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepLookupError, setCepLookupError] = useState('');
  
  // Estado para dados do produtor
  const [produtor, setProdutor] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    sexo: 'M',
    caf_dap: '',
    associacao_id: ''
  });

  // Estado para dados do endereço
  const [endereco, setEndereco] = useState({
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: ''
  });

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadProdutor = async () => {
      try {
        const data = await produtorService.detalhar(id);
        setProdutor({
          nome: data.nome || '',
          cpf: data.cpf || '',
          data_nascimento: data.data_nascimento ? String(data.data_nascimento).split('T')[0] : '',
          telefone: data.telefone || '',
          email: data.email || '',
          sexo: data.sexo || 'M',
          caf_dap: data.caf_dap || '',
          associacao_id: data.associacao_id ? String(data.associacao_id) : ''
        });
        setEndereco({
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          cep: data.cep || ''
        });
      } catch (error) {
        console.error('Erro ao carregar produtor:', error);
        alert('Não foi possível carregar o produtor.');
        navigate('/produtores');
      } finally {
        setInitialLoading(false);
      }
    };

    loadProdutor();
  }, [id, isEditMode, navigate]);

  const handleChangeProdutor = (e) => {
    const { name, value } = e.target;
    setProdutor(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeEndereco = (e) => {
    const { name, value } = e.target;
    if (name === 'cep') {
      setCepLookupError('');
      setEndereco(prev => ({ ...prev, cep: formatCep(value) }));
      return;
    }
    setEndereco(prev => ({ ...prev, [name]: value }));
  };

  const buscarCepBrasilApi = async (cepValue) => {
    const cepNumerico = onlyDigits(cepValue);
    if (cepNumerico.length !== 8) return;

    setCepLoading(true);
    setCepLookupError('');
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepNumerico}`);
      if (!response.ok) {
        throw new Error('CEP inválido');
      }

      const data = await response.json();
      setEndereco((prev) => ({
        ...prev,
        cep: formatCep(cepNumerico),
        logradouro: data?.street || prev.logradouro,
        bairro: data?.neighborhood || prev.bairro,
        cidade: data?.city || prev.cidade
      }));
    } catch {
      setCepLookupError('Não foi possível consultar este CEP.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await produtorService.atualizar(id, { produtor, endereco });
      } else {
        await produtorService.criar({ produtor, endereco });
      }
      navigate('/produtores');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message;
      const detail = status === 404
        ? 'Endpoint de atualização não encontrado. Reinicie a API backend para carregar as rotas novas.'
        : serverMessage || 'Verifique os dados informados.';
      alert(`Erro ao salvar produtor. ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="max-w-4xl mx-auto p-6 text-center text-gray-500">Carregando produtor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/produtores')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Detalhes do Produtor' : 'Novo Produtor'}</h1>
          <p className="text-sm text-gray-500">
            {isEditMode ? 'Edite os dados pessoais e de localização' : 'Preencha os dados pessoais e de localização'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Dados Pessoais</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Nome Completo *</label>
              <input
                type="text"
                name="nome"
                required
                value={produtor.nome}
                onChange={handleChangeProdutor}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CPF *</label>
              <input
                type="text"
                name="cpf"
                required
                value={produtor.cpf}
                onChange={handleChangeProdutor}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Data Nascimento</label>
              <input
                type="date"
                name="data_nascimento"
                value={produtor.data_nascimento}
                onChange={handleChangeProdutor}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={produtor.telefone}
                onChange={handleChangeProdutor}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={produtor.email}
                onChange={handleChangeProdutor}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sexo</label>
              <select
                name="sexo"
                value={produtor.sexo}
                onChange={handleChangeProdutor}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CAF / DAP</label>
              <input
                type="text"
                name="caf_dap"
                value={produtor.caf_dap}
                onChange={handleChangeProdutor}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Número do documento"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Endereço Principal</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CEP</label>
              <input
                type="text"
                name="cep"
                value={endereco.cep}
                onChange={handleChangeEndereco}
                onBlur={() => buscarCepBrasilApi(endereco.cep)}
                maxLength={9}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="00000-000"
              />
              {cepLoading && <p className="text-xs text-blue-600">Consultando CEP...</p>}
              {cepLookupError && <p className="text-xs text-rose-600">{cepLookupError}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Logradouro (Rua/Estrada/Linha)</label>
              <input
                type="text"
                name="logradouro"
                value={endereco.logradouro}
                onChange={handleChangeEndereco}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Número</label>
              <input
                type="text"
                name="numero"
                value={endereco.numero}
                onChange={handleChangeEndereco}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bairro / Comunidade</label>
              <input
                type="text"
                name="bairro"
                value={endereco.bairro}
                onChange={handleChangeEndereco}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cidade</label>
              <input
                type="text"
                name="cidade"
                value={endereco.cidade}
                onChange={handleChangeEndereco}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditMode ? 'Salvar Alterações' : 'Salvar Cadastro'}
          </button>
        </div>
      </form>
    </div>
  );
}
