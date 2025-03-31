import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Input,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/joy";
import ReactStars from "react-rating-stars-component";
import { createFeedback, checkFeedbackExistence } from "../../config/axios";
import { useSearchParams } from "react-router-dom";

const FeedbackForUser = () => {
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get("visitId");
  const accountId = searchParams.get("accountId");
  const [ratingValue, setRatingValue] = useState(3);
  const [comment, setComment] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [hasFeedback, setHasFeedback] = useState(null);

  useEffect(() => {
    if (!visitId || !accountId) {
      setSubmissionStatus("error");
      setHasFeedback(false);
      return;
    }

    const checkExistingFeedback = async () => {
      try {
        const exists = await checkFeedbackExistence(visitId);
        setHasFeedback(exists);
      } catch (error) {
        console.error("Error checking feedback existence:", error);
        setHasFeedback(false);
      }
    };

    checkExistingFeedback();
  }, [visitId, accountId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!visitId || !accountId || hasFeedback === true) {
      return;
    }

    setSubmissionStatus(null);
    try {
      const feedbackData = {
        visitId: parseInt(visitId, 10),
        accountId: parseInt(accountId, 10),
        rating: ratingValue,
        comment: comment,
      };
      await createFeedback(feedbackData);
      setSubmissionStatus("success");
      setHasFeedback(true);
      setRatingValue(3);
      setComment("");
    } catch (error) {
      console.error("Feedback submission error:", error);
      setSubmissionStatus("error");
    }
  };

  if (submissionStatus === "error" && hasFeedback === false) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert variant="soft" color="danger">
            <Typography level="h4">Lỗi</Typography>
            <Typography>
              Đã có lỗi xảy ra. Đường dẫn không hợp lệ hoặc thiếu thông tin cần
              thiết. Vui lòng kiểm tra lại đường dẫn hoặc liên hệ cơ sở tiêm
              chủng.
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  if (hasFeedback === true) {
    return (
      <Container
        maxWidth="sm"
        sx={{ 
          display: 'flex',      
          justifyContent: 'center', 
          alignItems: 'center',     
          minHeight: '100vh',    
        }}
      >
        <Box sx={{ textAlign: "center" }}> 
          <Alert variant="soft" color="success">
            <Typography>
              Bạn đã đánh giá dịch vụ tiêm chủng cho lần tiêm này rồi. Phản hồi
              của bạn đã được ghi nhận.
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  if (hasFeedback === null) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <CircularProgress size="lg" />
          <Typography sx={{ mt: 1 }}>Đang kiểm tra đánh giá...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography level="h2" textAlign="center" mb={2}>
          Đánh giá dịch vụ tiêm chủng
        </Typography>
        <Typography textAlign="center" mb={3} variant="body1">
          Vui lòng đánh giá trải nghiệm tiêm chủng của bạn để giúp chúng tôi cải
          thiện dịch vụ.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography level="body2">Đánh giá của bạn:</Typography>
            <ReactStars
              count={5}
              onChange={(newValue) => {
                setRatingValue(newValue);
              }}
              size={24}
              activeColor="#ffd700"
              value={ratingValue}
            />

            <Input
              placeholder="Chia sẻ thêm về trải nghiệm của bạn (tùy chọn)"
              multiline
              minRows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />

            <Button type="submit" variant="solid" disabled={hasFeedback === true}>
              Gửi đánh giá
            </Button>
          </Box>

          {submissionStatus === "success" && hasFeedback === true && (
            <Alert variant="soft" color="success" sx={{ mt: 2 }}>
              Cảm ơn bạn đã đánh giá! Phản hồi của bạn đã được ghi nhận.
            </Alert>
          )}

          {submissionStatus === "error" && submissionStatus !== 'error' && hasFeedback === false && (
            <Alert variant="soft" color="danger" sx={{ mt: 2 }}>
              Đã có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.
            </Alert>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default FeedbackForUser;