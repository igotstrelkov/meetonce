"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { WENT_POORLY_OPTIONS, WENT_WELL_OPTIONS } from "@/lib/constants";
import { useMutation } from "convex/react";
import { useState } from "react";

export default function PostDateFeedbackForm({
  matchId,
  userId,
  matchUserId,
  weekOf,
  onComplete,
}: any) {
  const submitFeedback = useMutation(api.feedback.submitDateFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dateHappened: "",
    overallRating: 0,
    wouldMeetAgain: "",
    wentWell: [] as string[],
    wentPoorly: [] as string[],
    conversationStartersHelpful: "",
    venueRating: "",
    additionalThoughts: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitFeedback({
        matchId,
        userId,
        matchUserId,
        weekOf,
        dateHappened: formData.dateHappened as any,
        overallRating: formData.overallRating || undefined,
        wouldMeetAgain: formData.wouldMeetAgain as any,
        wentWell: formData.wentWell.length > 0 ? formData.wentWell : undefined,
        wentPoorly:
          formData.wentPoorly.length > 0 ? formData.wentPoorly : undefined,
        conversationStartersHelpful:
          formData.conversationStartersHelpful as any,
        venueRating: formData.venueRating as any,
        additionalThoughts: formData.additionalThoughts || undefined,
      });

      onComplete?.();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
      setIsSubmitting(false);
    }
  };

  const toggleWentWell = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      wentWell: prev.wentWell.includes(option)
        ? prev.wentWell.filter((o) => o !== option)
        : [...prev.wentWell, option],
    }));
  };

  const toggleWentPoorly = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      wentPoorly: prev.wentPoorly.includes(option)
        ? prev.wentPoorly.filter((o) => o !== option)
        : [...prev.wentPoorly, option],
    }));
  };

  return (
    <div className="space-y-6 bg-white rounded-lg p-6 shadow-lg">
      <div>
        <h2 className="text-2xl font-bold mb-2">How did it go?</h2>
        <p className="text-gray-600">
          Your feedback helps us make better matches
        </p>
      </div>

      {/* Q1: Did date happen? */}
      <div className="space-y-2">
        <Label className="text-lg font-semibold">
          1. Did the date happen? *
        </Label>
        <RadioGroup
          value={formData.dateHappened}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, dateHappened: String(value) }))
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cancelled_by_them" id="cancelled_by_them" />
            <Label htmlFor="cancelled_by_them">They cancelled</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cancelled_by_me" id="cancelled_by_me" />
            <Label htmlFor="cancelled_by_me">I cancelled</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rescheduled" id="rescheduled" />
            <Label htmlFor="rescheduled">We rescheduled</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Only show remaining questions if date happened */}
      {formData.dateHappened === "yes" && (
        <>
          {/* Q2: Overall rating */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">
              2. Overall, how was the date? *
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, overallRating: rating }))
                  }
                  className={`w-12 h-12 rounded-lg text-lg transition-all ${
                    formData.overallRating === rating
                      ? "bg-pink-600 text-white scale-110"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {rating}★
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Would meet again? (PRIMARY METRIC!) */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">
              3. Would you want to see them again? *
            </Label>
            <RadioGroup
              value={formData.wouldMeetAgain}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  wouldMeetAgain: String(value),
                }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="meet-yes" />
                <Label
                  htmlFor="meet-yes"
                  className="text-green-600 font-semibold"
                >
                  Yes! I'd love a second date
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maybe" id="meet-maybe" />
                <Label htmlFor="meet-maybe">Maybe, I'm not sure yet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="meet-no" />
                <Label htmlFor="meet-no">No, not interested</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Q4: What went well? */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">
              4. What went well? (select all that apply)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {WENT_WELL_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`well-${option}`}
                    checked={formData.wentWell.includes(option)}
                    onCheckedChange={() => toggleWentWell(option)}
                  />
                  <Label htmlFor={`well-${option}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Q5: What didn't go well? */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">
              5. What didn't go well? (optional)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {WENT_POORLY_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`poorly-${option}`}
                    checked={formData.wentPoorly.includes(option)}
                    onCheckedChange={() => toggleWentPoorly(option)}
                  />
                  <Label
                    htmlFor={`poorly-${option}`}
                    className="cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Q6: Conversation starters */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">
              6. Were the conversation starters helpful?
            </Label>
            <RadioGroup
              value={formData.conversationStartersHelpful}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  conversationStartersHelpful: String(value),
                }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very" id="starters-very" />
                <Label htmlFor="starters-very">Very helpful</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="somewhat" id="starters-somewhat" />
                <Label htmlFor="starters-somewhat">Somewhat helpful</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_used" id="starters-not" />
                <Label htmlFor="starters-not">Didn't use them</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_helpful" id="starters-nope" />
                <Label htmlFor="starters-nope">Not helpful</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Q7: Venue rating */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">
              7. How was the suggested venue?
            </Label>
            <RadioGroup
              value={formData.venueRating}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, venueRating: String(value) }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="perfect" id="venue-perfect" />
                <Label htmlFor="venue-perfect">Perfect choice!</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="venue-good" />
                <Label htmlFor="venue-good">Good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="okay" id="venue-okay" />
                <Label htmlFor="venue-okay">Okay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_good" id="venue-bad" />
                <Label htmlFor="venue-bad">Not great</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="went_elsewhere" id="venue-elsewhere" />
                <Label htmlFor="venue-elsewhere">We went somewhere else</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Q8: Additional thoughts */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">
              8. Any additional thoughts? (optional)
            </Label>
            <Textarea
              value={formData.additionalThoughts}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  additionalThoughts: e.target.value,
                }))
              }
              placeholder="Tell us anything else about your experience..."
              className="min-h-[100px]"
            />
          </div>
        </>
      )}

      <Button
        onClick={handleSubmit}
        size="lg"
        className="w-full"
        disabled={!formData.dateHappened || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </div>
  );
}
