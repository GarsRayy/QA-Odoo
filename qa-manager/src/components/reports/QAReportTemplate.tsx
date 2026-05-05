import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statusBadge: {
    padding: '4 12',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    padding: 5,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    borderLeftWidth: 3,
  },
  cardLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    width: 'auto',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#1e293b',
    borderBottomWidth: 0,
  },
  tableColHeader: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    padding: 5,
  },
  tableCol: {
    fontSize: 8,
    padding: 5,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  aiSection: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  aiHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiText: {
    fontSize: 9,
    color: '#0c4a6e',
    lineHeight: 1.5,
    fontStyle: 'italic',
  }
});

interface TestCase {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: string;
  error?: string;
  aiAnalysis?: string;
}

interface QAReportProps {
  runId: string;
  projectName: string;
  timestamp: string;
  executedBy: string;
  testCases: TestCase[];
}

export const QAReportTemplate = ({ runId, projectName, timestamp, executedBy, testCases }: QAReportProps) => {
  const total = testCases.length;
  const passed = testCases.filter(t => t.status === 'passed').length;
  const failed = testCases.filter(t => t.status === 'failed').length;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>QA EXECUTION REPORT</Text>
            <Text style={styles.subTitle}>{projectName} • RUN ID: {runId}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: failed > 0 ? '#ef4444' : '#10b981' }]}>
            <Text>{failed > 0 ? 'STABLE WITH ERRORS' : 'SYSTEM STABLE'}</Text>
          </View>
        </View>

        {/* Executive Summary */}
        <Text style={styles.sectionTitle}>EXECUTIVE SUMMARY</Text>
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderLeftColor: '#3b82f6' }]}>
            <Text style={styles.cardLabel}>TOTAL TESTS</Text>
            <Text style={styles.cardValue}>{total}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#10b981' }]}>
            <Text style={styles.cardLabel}>PASSED</Text>
            <Text style={styles.cardValue}>{passed}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#ef4444' }]}>
            <Text style={styles.cardLabel}>FAILED</Text>
            <Text style={styles.cardValue}>{failed}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#8b5cf6' }]}>
            <Text style={styles.cardLabel}>SUCCESS RATE</Text>
            <Text style={styles.cardValue}>{successRate}%</Text>
          </View>
        </View>

        {/* Details Metadata */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 9, color: '#64748b' }}>Date: {timestamp}</Text>
          <Text style={{ fontSize: 9, color: '#64748b' }}>Operator: {executedBy}</Text>
        </View>

        {/* Test Case Table */}
        <Text style={styles.sectionTitle}>TEST CASE DETAILS</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableColHeader, { flex: 3 }]}>Test Scenario</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>Status</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>Duration</Text>
          </View>
          {testCases.map((test) => (
            <View key={test.id} style={styles.tableRow}>
              <Text style={[styles.tableCol, { flex: 3 }]}>{test.name}</Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: 'center', color: test.status === 'passed' ? '#10b981' : '#ef4444', fontWeight: 'bold' }]}>
                {test.status.toUpperCase()}
              </Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>{test.duration}</Text>
            </View>
          ))}
        </View>

        {/* AI Analysis Section (Only shown if there are failures) */}
        {testCases.some(t => t.aiAnalysis) && (
          <View wrap={false}>
            <Text style={[styles.sectionTitle, { backgroundColor: '#eff6ff', color: '#1e40af' }]}>🤖 AI SMART ANALYSIS</Text>
            {testCases.filter(t => t.aiAnalysis).map((test) => (
              <View key={`ai-${test.id}`} style={styles.aiSection}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#0369a1' }}>
                  Failure Analysis: {test.name}
                </Text>
                <Text style={styles.aiText}>{test.aiAnalysis}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by QA Management System Automation • Confidential • Page 1
        </Text>
      </Page>
    </Document>
  );
};
