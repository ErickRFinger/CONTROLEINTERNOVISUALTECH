// Sistema Empresarial - JavaScript Principal
class SistemaEmpresarial {
    constructor() {
        this.produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        this.vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        this.estoque = JSON.parse(localStorage.getItem('estoque')) || [];
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.loadData();
        this.updateDashboard();
        this.updateTables();
    }

    // Navegação entre seções
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSection = btn.dataset.section;
                
                // Atualizar botões ativos
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Mostrar seção correspondente
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetSection) {
                        section.classList.add('active');
                    }
                });
            });
        });
    }

    // Configurar event listeners
    setupEventListeners() {
        // Modal de produto
        const addProductModal = document.getElementById('add-product-modal');
        const addProductForm = document.getElementById('add-product-form');
        const closeButtons = document.querySelectorAll('.close');

        // Fechar modais
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                addProductModal.style.display = 'none';
                document.getElementById('add-sale-modal').style.display = 'none';
            });
        });

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target === addProductModal) {
                addProductModal.style.display = 'none';
            }
            if (e.target === document.getElementById('add-sale-modal')) {
                document.getElementById('add-sale-modal').style.display = 'none';
            }
        });

        // Formulário de produto
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarProduto();
        });

        // Formulário de venda
        document.getElementById('add-sale-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarVenda();
        });
    }

    // Adicionar produto
    adicionarProduto() {
        const nome = document.getElementById('product-name').value;
        const categoria = document.getElementById('product-category').value;
        const preco = parseFloat(document.getElementById('product-price').value);
        const estoqueInicial = parseInt(document.getElementById('product-stock').value);

        if (!nome || !categoria || !preco || !estoqueInicial) {
            this.showNotification('Preencha todos os campos!', 'error');
            return;
        }

        const produto = {
            id: Date.now(),
            nome,
            categoria,
            preco,
            estoque: estoqueInicial,
            dataCadastro: new Date().toISOString()
        };

        this.produtos.push(produto);
        this.salvarDados();
        this.updateDashboard();
        this.updateTables();
        this.fecharModal('add-product-modal');
        this.showNotification('Produto adicionado com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById('add-product-form').reset();
    }

    // Adicionar venda
    adicionarVenda() {
        const cliente = document.getElementById('sale-client').value;
        const produtosSelecionados = Array.from(document.getElementById('sale-products').selectedOptions);
        const quantidades = document.getElementById('sale-quantities').value.split(',').map(q => parseInt(q.trim()));

        if (!cliente || produtosSelecionados.length === 0 || quantidades.length === 0) {
            this.showNotification('Preencha todos os campos!', 'error');
            return;
        }

        if (produtosSelecionados.length !== quantidades.length) {
            this.showNotification('Número de produtos deve corresponder ao número de quantidades!', 'error');
            return;
        }

        let totalVenda = 0;
        const itensVenda = [];

        produtosSelecionados.forEach((option, index) => {
            const produto = this.produtos.find(p => p.id === parseInt(option.value));
            if (produto && produto.estoque >= quantidades[index]) {
                const subtotal = produto.preco * quantidades[index];
                totalVenda += subtotal;
                
                itensVenda.push({
                    produtoId: produto.id,
                    nome: produto.nome,
                    quantidade: quantidades[index],
                    precoUnitario: produto.preco,
                    subtotal
                });

                // Atualizar estoque
                produto.estoque -= quantidades[index];
            } else {
                this.showNotification(`Estoque insuficiente para ${produto?.nome || 'produto'}`, 'error');
                return;
            }
        });

        const venda = {
            id: Date.now(),
            cliente,
            itens: itensVenda,
            total: totalVenda,
            data: new Date().toISOString(),
            status: 'Concluída'
        };

        this.vendas.push(venda);
        this.salvarDados();
        this.updateDashboard();
        this.updateTables();
        this.fecharModal('add-sale-modal');
        this.showNotification('Venda registrada com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById('add-sale-form').reset();
    }

    // Atualizar dashboard
    updateDashboard() {
        const totalProdutos = this.produtos.length;
        const totalEstoque = this.produtos.reduce((total, p) => total + p.estoque, 0);
        const vendasMes = this.vendas.filter(v => {
            const dataVenda = new Date(v.data);
            const agora = new Date();
            return dataVenda.getMonth() === agora.getMonth() && 
                   dataVenda.getFullYear() === agora.getFullYear();
        }).length;
        const receitaTotal = this.vendas.reduce((total, v) => total + v.total, 0);

        // Atualizar números no dashboard
        document.querySelector('#dashboard .card:nth-child(1) .number').textContent = totalProdutos;
        document.querySelector('#dashboard .card:nth-child(2) .number').textContent = totalEstoque;
        document.querySelector('#dashboard .card:nth-child(3) .number').textContent = vendasMes;
        document.querySelector('#dashboard .card:nth-child(4) .number').textContent = `R$ ${receitaTotal.toFixed(2)}`;

        // Atualizar cards de estoque
        const baixoEstoque = this.produtos.filter(p => p.estoque <= 5).length;
        const emFalta = this.produtos.filter(p => p.estoque === 0).length;

        document.querySelector('#estoque .stock-card:nth-child(1) .number').textContent = baixoEstoque;
        document.querySelector('#estoque .stock-card:nth-child(2) .number').textContent = emFalta;
    }

    // Atualizar tabelas
    updateTables() {
        this.updateTabelaProdutos();
        this.updateTabelaEstoque();
        this.updateTabelaVendas();
        this.updateSelectProdutos();
    }

    // Atualizar tabela de produtos
    updateTabelaProdutos() {
        const tbody = document.getElementById('produtos-table');
        tbody.innerHTML = '';

        if (this.produtos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Nenhum produto cadastrado</td></tr>';
            return;
        }

        this.produtos.forEach(produto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.categoria}</td>
                <td>R$ ${produto.preco.toFixed(2)}</td>
                <td>${produto.estoque}</td>
                <td>
                    <button class="btn btn-primary" onclick="sistema.editarProduto(${produto.id})">Editar</button>
                    <button class="btn btn-warning" onclick="sistema.excluirProduto(${produto.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Atualizar tabela de estoque
    updateTabelaEstoque() {
        const tbody = document.getElementById('estoque-table');
        tbody.innerHTML = '';

        if (this.produtos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Nenhum item em estoque</td></tr>';
            return;
        }

        this.produtos.forEach(produto => {
            const status = produto.estoque === 0 ? 'Em Falta' : 
                          produto.estoque <= 5 ? 'Baixo Estoque' : 'Normal';
            const statusClass = produto.estoque === 0 ? 'danger' : 
                               produto.estoque <= 5 ? 'warning' : 'success';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${produto.nome}</td>
                <td>${produto.estoque}</td>
                <td>5</td>
                <td><span class="status-${statusClass}">${status}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="sistema.ajustarEstoque(${produto.id})">Ajustar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Atualizar tabela de vendas
    updateTabelaVendas() {
        const tbody = document.getElementById('vendas-table');
        tbody.innerHTML = '';

        if (this.vendas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Nenhuma venda registrada</td></tr>';
            return;
        }

        this.vendas.forEach(venda => {
            const data = new Date(venda.data).toLocaleDateString('pt-BR');
            const produtos = venda.itens.map(item => `${item.nome} (${item.quantidade})`).join(', ');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data}</td>
                <td>${venda.cliente}</td>
                <td>${produtos}</td>
                <td>R$ ${venda.total.toFixed(2)}</td>
                <td><span class="status-success">${venda.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    // Atualizar select de produtos para vendas
    updateSelectProdutos() {
        const select = document.getElementById('sale-products');
        select.innerHTML = '<option value="">Selecione os produtos</option>';
        
        this.produtos.forEach(produto => {
            if (produto.estoque > 0) {
                const option = document.createElement('option');
                option.value = produto.id;
                option.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)} (Estoque: ${produto.estoque})`;
                select.appendChild(option);
            }
        });
    }

    // Editar produto
    editarProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (produto) {
            // Implementar modal de edição
            this.showNotification('Funcionalidade de edição em desenvolvimento', 'info');
        }
    }

    // Excluir produto
    excluirProduto(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.produtos = this.produtos.filter(p => p.id !== id);
            this.salvarDados();
            this.updateDashboard();
            this.updateTables();
            this.showNotification('Produto excluído com sucesso!', 'success');
        }
    }

    // Ajustar estoque
    ajustarEstoque(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (produto) {
            const novaQuantidade = prompt(`Ajustar estoque de ${produto.nome}:`, produto.estoque);
            if (novaQuantidade !== null && !isNaN(novaQuantidade)) {
                produto.estoque = parseInt(novaQuantidade);
                this.salvarDados();
                this.updateDashboard();
                this.updateTables();
                this.showNotification('Estoque ajustado com sucesso!', 'success');
            }
        }
    }

    // Salvar dados no localStorage
    salvarDados() {
        localStorage.setItem('produtos', JSON.stringify(this.produtos));
        localStorage.setItem('vendas', JSON.stringify(this.vendas));
        localStorage.setItem('estoque', JSON.stringify(this.estoque));
    }

    // Carregar dados
    loadData() {
        // Dados já carregados no constructor
    }

    // Mostrar modal
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    // Fechar modal
    fecharModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        // Cores baseadas no tipo
        const colors = {
            success: 'linear-gradient(135deg, #56ab2f, #a8e6cf)',
            error: 'linear-gradient(135deg, #f093fb, #f5576c)',
            warning: 'linear-gradient(135deg, #f093fb, #f5576c)',
            info: 'linear-gradient(135deg, #667eea, #764ba2)'
        };

        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Funções globais para os botões
function showAddProductForm() {
    document.getElementById('add-product-modal').style.display = 'block';
}

function showAddSaleForm() {
    document.getElementById('add-sale-modal').style.display = 'block';
}

// Inicializar sistema quando a página carregar
let sistema;
document.addEventListener('DOMContentLoaded', () => {
    sistema = new SistemaEmpresarial();
});

// Adicionar estilos para notificações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .status-success { color: #28a745; font-weight: 600; }
    .status-warning { color: #ffc107; font-weight: 600; }
    .status-danger { color: #dc3545; font-weight: 600; }
    
    .btn-warning {
        background: linear-gradient(135deg, #ffc107, #fd7e14);
        color: white;
        margin-left: 5px;
    }
    
    .btn-warning:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 193, 7, 0.4);
    }
`;
document.head.appendChild(style);
