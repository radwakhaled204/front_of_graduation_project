import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "./ExamCard.css";
import linkhost from "../..";
import { useExamsStore } from "../../hooks/useExams";
import { ExamCard } from "./ExamCard";
import ManCying from "../../assets/svg/ManCrying/ManCrying";

const ExamsContainer = ({ subjectId, openDropdown, updateDropdown, refresh}) => {
  const { allExams, loading, fetchExams } = useExamsStore();
  //const [fetchedExams, setFetchedExams] = useState(exams);
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams(); // Fetch exams when component mounts
  }, [refresh]);

  const exams = subjectId === -1 ? allExams : allExams.filter(exam => exam.subjectId == subjectId);

  // useEffect(() => {
  //   setFetchedExams(exams);
  // }, [exams]);

  // useEffect(() => {
  //   setOpenMenu(null);
  // }, [openDropdown]);

  const toggleMenu = (examId, e) => {
    e.stopPropagation();
    updateDropdown(true);
    setOpenMenu(openMenu === examId ? null : examId);
  };

  const handleDelete = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await axios.delete(`${linkhost}/api/Exam/${examId}`);
        fetchExams();
        //setFetchedExams(exams.filter((exam) => exam.examId !== examId));
      } catch (error) {
        console.error("Error deleting exam:", error);
      }
    }
  };

  const handleRetry = async (exam) => {
    try {
      const response = await axios.get(`${linkhost}/api/Exam/${exam.examId}`);
      const fetchedExam = response.data;

      if (fetchedExam && fetchedExam.mcqQuestionsData) {
        localStorage.setItem(
          "generatedQuestions",
          JSON.stringify({
            questionData: fetchedExam.mcqQuestionsData.map((q) => ({
              questionNumber: q.id,
              question: q.text,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explain,
            })),
          })
        );

        navigate("/PracticeMode", {
          state: {
            options: {
              difficulty: fetchedExam.difficultyLevel,
              questionType: fetchedExam.questionType,
              examName: fetchedExam.examName,
              examId: fetchedExam.examId,
              subjectId: fetchedExam.subjectId,
              retry: true,
            },
          },
        });
      } else {
        console.error("No questions found in the fetched exam.");
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
    }
  };
  

  return (
    <DndProvider backend={HTML5Backend}>
      {loading ? 
      <p>Loading Exams...</p> :
      <div className="library-exam-grid">
        {allExams.length === 0 ? (
          <div className="no-exams-found">
          <p style={{color: "#202020", "margin-bottom": "20px", "font-size": "clamp(25px, 1vw, 30px)"}}>No exams generated yet.</p>
          <ManCying width={207} height={213}/>
          </div>
        ) : (
          exams.map((exam) => (
            <ExamCard
              key={exam.examId}
              exam={exam}
              handleRetry={handleRetry}
              handleDelete={handleDelete}
              openMenu={openMenu}
              toggleMenu={toggleMenu}
              openDropdown={openDropdown}
            />
          ))
        )}
      </div>
      }
    </DndProvider>
  );
};

export default ExamsContainer;
