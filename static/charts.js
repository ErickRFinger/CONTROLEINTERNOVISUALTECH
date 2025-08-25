// 📊 Sistema Avançado de Gráficos com Chart.js
class ChartManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#56ab2f',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#17a2b8'
        };
        this.init();
    }

    async init() {
        await this.loadChartJS();
        this.setupCharts();
    }

    async loadChartJS() {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            document.head.appendChild(script);
            
            return new Promise((resolve) => {
                script.onload = resolve;
            });
        }
    }

    setupCharts() {
        this.createVendasChart();
        this.createProdutosChart();
        this.createEstoqueChart();
        this.createReceitaChart();
    }

    // 📈 Gráfico de Vendas por Período
    createVendasChart() {
        const ctx = document.getElementById('vendas-chart');
        if (!ctx) return;

        const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
        const dados = this.processarDadosVendas(vendas);

        this.charts.vendas = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dados.labels,
                datasets: [{
                    label: 'Vendas (R$)',
                    data: dados.valores,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: this.colors.primary,
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // 🏆 Gráfico de Produtos Mais Vendidos
    createProdutosChart() {
        const ctx = document.getElementById('produtos-chart');
        if (!ctx) return;

        const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
        const dados = this.processarDadosProdutos(vendas);

        this.charts.produtos = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: dados.labels,
                datasets: [{
                    data: dados.valores,
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.success,
                        this.colors.warning,
                        this.colors.danger,
                        this.colors.info
                    ],
                    borderColor: '#fff',
                    borderWidth: 3,
                    hoverBorderWidth: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} vendas (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 2000
                }
            }
        });
    }

    // 📦 Gráfico de Estoque
    createEstoqueChart() {
        const ctx = document.getElementById('estoque-chart');
        if (!ctx) return;

        const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
        const dados = this.processarDadosEstoque(produtos);

        this.charts.estoque = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dados.labels,
                datasets: [{
                    label: 'Estoque Atual',
                    data: dados.valores,
                    backgroundColor: dados.cores,
                    borderColor: dados.cores,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // 💰 Gráfico de Receita
    createReceitaChart() {
        const ctx = document.getElementById('receita-chart');
        if (!ctx) return;

        const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
        const dados = this.processarDadosReceita(vendas);

        this.charts.receita = new Chart(ctx, {
            type: 'area',
            data: {
                labels: dados.labels,
                datasets: [{
                    label: 'Receita Acumulada',
                    data: dados.valores,
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '40',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.success,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                return 'Receita: R$ ' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                animation: {
                    duration: 2500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // 🔄 Processar dados para gráficos
    processarDadosVendas(vendas) {
        const hoje = new Date();
        const ultimos7Dias = [];
        
        for (let i = 6; i >= 0; i--) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            ultimos7Dias.push(data.toLocaleDateString('pt-BR', { weekday: 'short' }));
        }

        const vendasPorDia = new Array(7).fill(0);
        
        vendas.forEach(venda => {
            const dataVenda = new Date(venda.data);
            const diffDias = Math.floor((hoje - dataVenda) / (1000 * 60 * 60 * 24));
            
            if (diffDias >= 0 && diffDias < 7) {
                vendasPorDia[6 - diffDias] += venda.total;
            }
        });

        return {
            labels: ultimos7Dias,
            valores: vendasPorDia
        };
    }

    processarDadosProdutos(vendas) {
        const produtosVendidos = {};
        
        vendas.forEach(venda => {
            venda.itens.forEach(item => {
                if (produtosVendidos[item.nome]) {
                    produtosVendidos[item.nome] += item.quantidade;
                } else {
                    produtosVendidos[item.nome] = item.quantidade;
                }
            });
        });

        const sorted = Object.entries(produtosVendidos)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);

        return {
            labels: sorted.map(([nome]) => nome),
            valores: sorted.map(([, quantidade]) => quantidade)
        };
    }

    processarDadosEstoque(produtos) {
        const dados = produtos.slice(0, 8);
        
        return {
            labels: dados.map(p => p.nome.length > 15 ? p.nome.substring(0, 15) + '...' : p.nome),
            valores: dados.map(p => p.estoque),
            cores: dados.map(p => {
                if (p.estoque === 0) return this.colors.danger;
                if (p.estoque <= 5) return this.colors.warning;
                return this.colors.success;
            })
        };
    }

    processarDadosReceita(vendas) {
        const hoje = new Date();
        const ultimos30Dias = [];
        
        for (let i = 29; i >= 0; i--) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            ultimos30Dias.push(data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        }

        const receitaAcumulada = [];
        let acumulado = 0;
        
        ultimos30Dias.forEach((_, index) => {
            const vendasDoDia = vendas.filter(venda => {
                const dataVenda = new Date(venda.data);
                const diffDias = Math.floor((hoje - dataVenda) / (1000 * 60 * 60 * 24));
                return diffDias === (29 - index);
            });
            
            const receitaDoDia = vendasDoDia.reduce((total, venda) => total + venda.total, 0);
            acumulado += receitaDoDia;
            receitaAcumulada.push(acumulado);
        });

        return {
            labels: ultimos30Dias,
            valores: receitaAcumulada
        };
    }

    // 🔄 Atualizar todos os gráficos
    updateAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.update === 'function') {
                chart.update('active');
            }
        });
    }

    // 🎨 Aplicar tema escuro/claro
    applyTheme(theme) {
        const isDark = theme === 'dark';
        const textColor = isDark ? '#fff' : '#333';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        Object.values(this.charts).forEach(chart => {
            if (chart && chart.options) {
                chart.options.scales.y.grid.color = gridColor;
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.y.ticks.color = textColor;
                chart.options.scales.x.ticks.color = textColor;
                chart.update();
            }
        });
    }

    // 🗑️ Destruir gráficos
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Exportar para uso global
window.ChartManager = ChartManager;
