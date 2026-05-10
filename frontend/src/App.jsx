import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import LoadingPage from './pages/LoadingPage';
import ReportPage from './pages/ReportPage';
import SubmitPage from './pages/SubmitPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';
import { analyseDeck, getReport } from './api/analyse';

function DealLensFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeSection, setActiveSection] = useState('scorecard');
  const [liveReport, setLiveReport] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = async (file) => {
    setUploadError(null);
    setCurrentStep(1);
    setLiveReport(null);
    navigate('/loading');
    
    // Optimistic loading animation (caps at step 4 until the API resolves)
    let step = 1;
    const interval = setInterval(() => {
      step = step < 4 ? step + 1 : 4; 
      setCurrentStep(step);
    }, 4000); 

    try {
      const data = await analyseDeck(file);
      clearInterval(interval);
      setCurrentStep(5);
      setLiveReport(data);
      
      // Let the loading scene travel to step 5, show the final card, then zoom out.
      setTimeout(() => navigate(`/report/${data.report_id}`), 5000);
      
    } catch (err) {
      clearInterval(interval);
      console.error("Upload error:", err);
      setUploadError(err.response?.data?.detail || "Analysis failed. Ensure the backend is running.");
      navigate('/');
    }
  };

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Routes>
      <Route path="/" element={<UploadPage onUpload={handleUpload} error={uploadError} />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/loading" element={<LoadingPage currentStep={currentStep} />} />
      <Route 
        path="/report/:id" 
        element={
          <ReportRouteWrapper 
            liveReport={liveReport}
            activeSection={activeSection}
            handleNavigate={handleNavigate}
          />
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function ReportRouteWrapper({ liveReport, activeSection, handleNavigate }) {
  const { id } = useParams();
  const [reportData, setReportData] = useState(liveReport);
  const [loading, setLoading] = useState(!liveReport && id);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const hydrateReportFromBackend = async () => {
      // Always render fast if we already have local live data,
      // but still refresh from backend as the source of truth.
      if (liveReport) {
        setReportData(liveReport);
        setLoading(false);
      } else {
        setLoading(true);
      }

      setFetchError(null);

      const maxAttempts = 5;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const data = await getReport(id);
          if (cancelled) return;

          setReportData(data);

          const hasQuestions = Array.isArray(data?.questions) && data.questions.length > 0;
          const isLastAttempt = attempt === maxAttempts;

          // Retry briefly if report exists but questions are still empty
          // to avoid showing a false "not generated" state from transient lag.
          if (hasQuestions || isLastAttempt) {
            setLoading(false);
            return;
          }
        } catch (err) {
          if (cancelled) return;
          console.error("Failed to fetch report:", err);
          if (attempt === maxAttempts) {
            setFetchError("Could not load report from backend.");
            setLoading(false);
            return;
          }
        }

        await wait(1200);
      }
    };

    hydrateReportFromBackend();

    return () => {
      cancelled = true;
    };
  }, [id, liveReport]);

  if (loading) {
    return <div className="min-h-screen bg-[#08090a] flex items-center justify-center text-[#8a8f98]">Loading report...</div>;
  }

  if (fetchError || !reportData) {
    return <NotFound />;
  }

  return (
    <ReportPage 
      report={reportData}
      reportId={id}
      filename={reportData.file_name || "report.pdf"}
      activeSection={activeSection}
      onNavigate={handleNavigate}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <DealLensFlow />
    </BrowserRouter>
  );
}

export default App;
