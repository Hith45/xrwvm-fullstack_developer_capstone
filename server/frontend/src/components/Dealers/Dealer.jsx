import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header/Header";
import "./Dealers.css";
import "../assets/style.css";
import positiveIcon from "../assets/positive.png";
import negativeIcon from "../assets/negative.png";
import neutralIcon from "../assets/neutral.png";

const Dealer = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/djangoapp/getdealer/${id}`).then((r) => {
        if (!r.ok) throw new Error("Dealer not found");
        return r.json();
      }),
      fetch(`/djangoapp/get_dealer_reviews/${id}`).then((r) => {
        if (!r.ok) throw new Error("Could not load reviews");
        return r.json();
      }),
    ])
      .then(([dealerData, reviewData]) => {
        setDealer(dealerData);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const sentimentIcon = (sentiment) => {
    if (sentiment === "positive") return positiveIcon;
    if (sentiment === "negative") return negativeIcon;
    return neutralIcon;
  };

  return (
    <div>
      <Header />
      <main className="container mt-4">
        {error && <p role="alert">{error}</p>}

        {dealer && (
          <>
            <h2>{dealer.full_name}</h2>
            <p>
              {dealer.city}, {dealer.address}, Zip - {dealer.zip},{" "}
              {dealer.state}
            </p>

            {sessionStorage.getItem("username") && (
              <a href={`/postreview/${id}`}>Review Dealer</a>
            )}

            <h3 className="mt-4">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div className="review_panel mb-3" key={review.id}>
                  <img
                    src={sentimentIcon(review.sentiment)}
                    className="emotion_icon"
                    alt={review.sentiment || "Sentiment not analyzed"}
                  />
                  <div className="review">{review.review}</div>
                  <div className="reviewer">
                    {review.name} {review.car_make} {review.car_model}{" "}
                    {review.car_year}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dealer;
