import React from 'react';
import { Card, Select, DatePicker, Button, Row, Col } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Performances = () => {
    const taskData = [
        { name: 'Jan', completed: 40, inProgress: 20 },
        { name: 'Feb', completed: 50, inProgress: 30 },
        { name: 'Mar', completed: 60, inProgress: 40 },
        { name: 'Apr', completed: 70, inProgress: 50 },
    ];

    const delayData = [
        { name: 'Projet A', actual: 10, planned: 8 },
        { name: 'Projet B', actual: 15, planned: 12 },
        { name: 'Projet C', actual: 20, planned: 18 },
    ];

    const heatmapData = [
        { day: 'Lundi', hour: '9h', value: 5 },
        { day: 'Lundi', hour: '10h', value: 8 },
        { day: 'Mardi', hour: '9h', value: 3 },
        { day: 'Mardi', hour: '10h', value: 7 },
    ];

    return (
        <div className="performances-page">
            {/* En-tête */}
            <header>
                <h1 style={{ color: '#1890ff' }}>Suivi des Performances</h1>
                <div className="filters">
                    <Select placeholder="Sélectionner un projet" style={{ width: 200 }} />
                    <DatePicker.RangePicker style={{ marginLeft: 10 }} />
                    <Button type="primary" style={{ marginLeft: 10 }}>Filtrer</Button>
                </div>
            </header>

            {/* Section 1 : Vue Globale */}
            <section>
                <Row gutter={16}>
                    <Col span={6}>
                        <Card title="Taux d’avancement (%)" style={{ backgroundColor: '#e6f7ff' }}>
                            <h2 style={{ color: '#1890ff' }}>75%</h2>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Délai moyen des tâches" style={{ backgroundColor: '#fffbe6' }}>
                            <h2 style={{ color: '#faad14' }}>5 jours</h2>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Respect des échéances" style={{ backgroundColor: '#f6ffed' }}>
                            <h2 style={{ color: '#52c41a' }}>90%</h2>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Risques détectés" style={{ backgroundColor: '#fff1f0' }}>
                            <h2 style={{ color: '#f5222d' }}>3</h2>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Section 2 : Graphiques */}
            <section>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Courbe d’évolution des tâches">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={taskData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="completed" stroke="#1890ff" name="Tâches terminées" />
                                    <Line type="monotone" dataKey="inProgress" stroke="#faad14" name="Tâches en cours" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Diagramme des délais vs prévus">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={delayData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="actual" fill="#f5222d" name="Délais réels" />
                                    <Bar dataKey="planned" fill="#52c41a" name="Délais prévus" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Heatmap des périodes de forte activité">
                            {/* Placeholder pour Heatmap */}
                            <div style={{ textAlign: 'center', padding: '50px', color: '#8c8c8c' }}>
                                Heatmap des périodes de forte activité (à implémenter)
                            </div>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Section 3 : Analyse détaillée */}
            <section>
                <Card title="Performance individuelle">
                    {/* Détails des membres */}
                </Card>
                <Card title="Suivi des risques" style={{ marginTop: 16 }}>
                    {/* Détails des risques */}
                </Card>
            </section>

            {/* Section 4 : Actions */}
            <section>
                <Card title="Actions IA">
                    <Button type="primary">Replanifier</Button>
                </Card>
                <Card title="Exporter rapports" style={{ marginTop: 16 }}>
                    <Button type="primary">PDF</Button>
                    <Button style={{ marginLeft: 10 }}>CSV</Button>
                </Card>
            </section>
        </div>
    );
};

export default Performances;
