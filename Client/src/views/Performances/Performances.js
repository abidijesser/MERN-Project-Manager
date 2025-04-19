import React, { useState, useEffect } from 'react';
import { Card, Select, DatePicker, Button, Row, Col, Alert, Spin, Table, Tag, Progress, Empty, Modal, Tabs, Statistic } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { getProjectsPerformance, exportToPDF, exportToCSV } from '../../services/performanceService';
import { DownloadOutlined, FilterOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined, BarChartOutlined, PieChartOutlined, RadarChartOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const Performances = () => {
    const [projectsPerformance, setProjectsPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        projectId: null,
        dateRange: null
    });
    const [selectedProject, setSelectedProject] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [exportLoading, setExportLoading] = useState({
        pdf: false,
        csv: false
    });

    // Charger les données de performance
    const fetchData = async (filterParams = {}) => {
        try {
            setLoading(true);
            const data = await getProjectsPerformance(filterParams);
            setProjectsPerformance(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load project performance data');
            console.error('Error loading project performance:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Appliquer les filtres
    const handleApplyFilters = () => {
        fetchData(filters);
    };

    // Réinitialiser les filtres
    const handleResetFilters = () => {
        setFilters({
            projectId: null,
            dateRange: null
        });
        fetchData();
    };

    // Gestion des exports
    const handleExportPDF = async () => {
        try {
            setExportLoading(prev => ({ ...prev, pdf: true }));
            const result = await exportToPDF(projectsPerformance);
            alert(`Rapport PDF exporté avec succès: ${result.filename}`);
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            alert('Erreur lors de l\'export PDF');
        } finally {
            setExportLoading(prev => ({ ...prev, pdf: false }));
        }
    };

    const handleExportCSV = async () => {
        try {
            setExportLoading(prev => ({ ...prev, csv: true }));
            const result = await exportToCSV(projectsPerformance);
            alert(`Rapport CSV exporté avec succès: ${result.filename}`);
        } catch (error) {
            console.error('Erreur lors de l\'export CSV:', error);
            alert('Erreur lors de l\'export CSV');
        } finally {
            setExportLoading(prev => ({ ...prev, csv: false }));
        }
    };

    // Afficher les détails d'un projet
    const showProjectDetails = (project) => {
        setSelectedProject(project);
        setIsDetailModalVisible(true);
    };

    // Fermer la modal de détails
    const handleCloseDetailModal = () => {
        setIsDetailModalVisible(false);
    };

    // Couleurs pour les statuts
    const statusColors = {
        'completed': '#52c41a',  // vert
        'in-progress': '#1890ff', // bleu
        'delayed': '#faad14',    // orange
        'at-risk': '#f5222d'     // rouge
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Chargement des données de performance..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    message="Erreur"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="performances-page">
            {/* En-tête */}
            <header>
                <h1 style={{ color: '#1890ff' }}>Suivi des Performances</h1>
                <div className="filters">
                    <Select
                        placeholder="Sélectionner un projet"
                        style={{ width: 200 }}
                        value={filters.projectId}
                        onChange={(value) => setFilters(prev => ({ ...prev, projectId: value }))}
                        allowClear
                        options={projectsPerformance?.projects.map(project => ({
                            value: project._id,
                            label: project.projectName || `Projet ${project._id.substring(0, 5)}`
                        })) || []}
                    />
                    <DatePicker.RangePicker
                        style={{ marginLeft: 10 }}
                        value={filters.dateRange}
                        onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                    />
                    <Button
                        type="primary"
                        icon={<FilterOutlined />}
                        style={{ marginLeft: 10 }}
                        onClick={handleApplyFilters}
                    >
                        Filtrer
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        style={{ marginLeft: 10 }}
                        onClick={handleResetFilters}
                    >
                        Réinitialiser
                    </Button>
                </div>
            </header>

            {/* Section 1 : Vue Globale */}
            <section>
                <Row gutter={16}>
                    <Col span={6}>
                        <Card title="Taux d'avancement (%)" style={{ backgroundColor: '#e6f7ff' }}>
                            <h2 style={{ color: '#1890ff' }}>
                                {projectsPerformance ? `${projectsPerformance.kpis.averageCompletionRate}%` : '75%'}
                            </h2>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Efficacité temporelle" style={{ backgroundColor: '#fffbe6' }}>
                            <h2 style={{ color: '#faad14' }}>
                                {projectsPerformance ? `${projectsPerformance.kpis.averageTimeEfficiency}%` : '80%'}
                            </h2>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Projets à risque" style={{ backgroundColor: '#f6ffed' }}>
                            <h2 style={{ color: '#52c41a' }}>
                                {projectsPerformance ? projectsPerformance.kpis.projectsAtRisk : '2'}
                            </h2>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Risques détectés" style={{ backgroundColor: '#fff1f0' }}>
                            <h2 style={{ color: '#f5222d' }}>
                                {projectsPerformance ? projectsPerformance.kpis.totalRisks : '5'}
                            </h2>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Section 2 : Graphiques */}
            <section>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Performance des projets">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                    { name: 'Projet A', completion: 75, efficiency: 80, risk: 15 },
                                    { name: 'Projet B', completion: 45, efficiency: 60, risk: 30 },
                                    { name: 'Projet C', completion: 90, efficiency: 95, risk: 5 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="completion" fill="#1890ff" name="Taux d'achèvement" />
                                    <Bar dataKey="efficiency" fill="#52c41a" name="Efficacité temporelle" />
                                    <Bar dataKey="risk" fill="#f5222d" name="Niveau de risque" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Répartition des statuts de projets">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Terminés', value: 2, color: statusColors['completed'] },
                                            { name: 'En cours', value: 5, color: statusColors['in-progress'] },
                                            { name: 'En retard', value: 1, color: statusColors['delayed'] },
                                            { name: 'À risque', value: 2, color: statusColors['at-risk'] }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {[
                                            { name: 'Terminés', value: 2, color: statusColors['completed'] },
                                            { name: 'En cours', value: 5, color: statusColors['in-progress'] },
                                            { name: 'En retard', value: 1, color: statusColors['delayed'] },
                                            { name: 'À risque', value: 2, color: statusColors['at-risk'] }
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Section 3 : Analyse détaillée */}
            <section>
                <Card title="Performance détaillée des projets">
                    <Table
                        columns={[
                            {
                                title: 'Projet',
                                dataIndex: 'name',
                                key: 'name',
                            },
                            {
                                title: 'Statut',
                                dataIndex: 'status',
                                key: 'status',
                                render: (status) => {
                                    let color = statusColors[status] || '#1890ff';
                                    let text = 'Inconnu';

                                    if (status === 'completed') text = 'Terminé';
                                    else if (status === 'in-progress') text = 'En cours';
                                    else if (status === 'delayed') text = 'En retard';
                                    else if (status === 'at-risk') text = 'À risque';

                                    return <Tag color={color}>{text}</Tag>;
                                }
                            },
                            {
                                title: 'Progression',
                                dataIndex: 'completion',
                                key: 'completion',
                                render: (completion) => <Progress percent={completion} size="small" />
                            },
                            {
                                title: 'Efficacité',
                                dataIndex: 'efficiency',
                                key: 'efficiency',
                                render: (efficiency) => {
                                    let color = '#52c41a';
                                    if (efficiency < 70) color = '#f5222d';
                                    else if (efficiency < 90) color = '#faad14';

                                    return <span style={{ color }}>{efficiency}%</span>;
                                }
                            },
                            {
                                title: 'Risque',
                                dataIndex: 'risk',
                                key: 'risk',
                                render: (risk) => {
                                    let color = '#52c41a';
                                    if (risk > 30) color = '#f5222d';
                                    else if (risk > 10) color = '#faad14';

                                    return <span style={{ color }}>{risk}%</span>;
                                }
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                render: (_, record, index) => (
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={() => showProjectDetails({
                                            _id: record.key,
                                            projectName: record.name,
                                            performance: {
                                                completionRate: record.completion,
                                                timeEfficiency: record.efficiency,
                                                riskLevel: record.risk,
                                                resourceUtilization: 85,
                                                taskCount: 10,
                                                completedTaskCount: Math.round(10 * record.completion / 100),
                                                lateTaskCount: Math.round(10 * record.risk / 100)
                                            }
                                        })}
                                    >
                                        Détails
                                    </Button>
                                )
                            }
                        ]}
                        dataSource={[
                            { key: 1, name: 'Projet A', status: 'in-progress', completion: 75, efficiency: 80, risk: 15 },
                            { key: 2, name: 'Projet B', status: 'delayed', completion: 45, efficiency: 60, risk: 30 },
                            { key: 3, name: 'Projet C', status: 'completed', completion: 90, efficiency: 95, risk: 5 }
                        ]}
                        pagination={false}
                    />
                </Card>

                <Card title="Recommandations IA" style={{ marginTop: 16 }}>
                    <Alert
                        message="Projet à risque détecté"
                        description="Le projet B présente un niveau de risque élevé. Considérez une révision des échéances ou une réallocation des ressources."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 10 }}
                    />
                    <Alert
                        message="Efficacité temporelle faible"
                        description="L'efficacité temporelle moyenne des projets est de 80%. Envisagez de revoir la planification des projets."
                        type="info"
                        showIcon
                        style={{ marginBottom: 10 }}
                    />
                    <Alert
                        message="Projet performant: Projet C"
                        description="Le projet C montre d'excellentes performances. Analysez ses méthodes de gestion pour les appliquer à d'autres projets."
                        type="success"
                        showIcon
                        style={{ marginBottom: 10 }}
                    />
                </Card>
            </section>

            {/* Section 4 : Actions */}
            <section>
                <Card title="Exporter rapports" style={{ marginTop: 16 }}>
                    <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        onClick={handleExportPDF}
                        loading={exportLoading.pdf}
                    >
                        Exporter en PDF
                    </Button>
                    <Button
                        style={{ marginLeft: 10 }}
                        icon={<FileExcelOutlined />}
                        onClick={handleExportCSV}
                        loading={exportLoading.csv}
                    >
                        Exporter en CSV
                    </Button>
                </Card>

                {/* Modal de détails du projet */}
                <Modal
                    title={selectedProject ? `Détails du projet: ${selectedProject.projectName}` : 'Détails du projet'}
                    open={isDetailModalVisible}
                    onCancel={handleCloseDetailModal}
                    width={800}
                    footer={[
                        <Button key="close" onClick={handleCloseDetailModal}>
                            Fermer
                        </Button>
                    ]}
                >
                    {selectedProject && (
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Informations générales" key="1">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic title="Taux d'achèvement" value={selectedProject.performance.completionRate} suffix="%" />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic title="Efficacité temporelle" value={selectedProject.performance.timeEfficiency} suffix="%" />
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginTop: 20 }}>
                                    <Col span={12}>
                                        <Statistic title="Niveau de risque" value={selectedProject.performance.riskLevel} suffix="%" />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic title="Utilisation des ressources" value={selectedProject.performance.resourceUtilization} suffix="%" />
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tab="Tâches" key="2">
                                <Row>
                                    <Col span={8}>
                                        <Statistic title="Total des tâches" value={selectedProject.performance.taskCount} />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic title="Tâches terminées" value={selectedProject.performance.completedTaskCount} />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic title="Tâches en retard" value={selectedProject.performance.lateTaskCount} />
                                    </Col>
                                </Row>
                                <div style={{ marginTop: 20 }}>
                                    <Progress
                                        percent={selectedProject.performance.completionRate}
                                        status={selectedProject.performance.completionRate === 100 ? 'success' : 'active'}
                                        strokeColor={{
                                            '0%': '#108ee9',
                                            '100%': '#87d068',
                                        }}
                                    />
                                </div>
                            </TabPane>
                            <TabPane tab="Analyse de performance" key="3">
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart outerRadius={90} data={[
                                        {
                                            subject: 'Achèvement',
                                            value: selectedProject.performance.completionRate,
                                            fullMark: 100
                                        },
                                        {
                                            subject: 'Efficacité',
                                            value: selectedProject.performance.timeEfficiency,
                                            fullMark: 100
                                        },
                                        {
                                            subject: 'Ressources',
                                            value: selectedProject.performance.resourceUtilization,
                                            fullMark: 100
                                        },
                                        {
                                            subject: 'Qualité',
                                            value: 100 - selectedProject.performance.riskLevel,
                                            fullMark: 100
                                        },
                                        {
                                            subject: 'Respect des délais',
                                            value: selectedProject.performance.timeEfficiency > 80 ? 90 : 70,
                                            fullMark: 100
                                        }
                                    ]}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                        <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </TabPane>
                        </Tabs>
                    )}
                </Modal>
            </section>
        </div>
    );
};

export default Performances;
