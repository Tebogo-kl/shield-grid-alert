import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Star, Send, MessageSquare, Clock, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IncidentReportFormProps {
  requestId?: string;
  officerName?: string;
  serviceType?: string;
  userType: 'user' | 'officer';
  onSubmit?: (report: IncidentReport) => void;
}

interface IncidentReport {
  requestId: string;
  rating: number;
  incidentType: string;
  description: string;
  additionalComments: string;
  timestamp: Date;
}

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
  userType: 'user' | 'officer' | 'admin';
}

const IncidentReportForm: React.FC<IncidentReportFormProps> = ({
  requestId = 'REQ-001',
  officerName = 'Officer John Doe',
  serviceType = 'Armed Response',
  userType,
  onSubmit,
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock comments for demonstration
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: userType === 'user' ? 'Officer John Doe' : 'Client: Sarah Smith',
      message: 'Arrived at location and secured the premises. All clear.',
      timestamp: new Date(Date.now() - 3600000),
      userType: userType === 'user' ? 'officer' : 'user',
    },
    {
      id: '2',
      author: userType === 'user' ? 'You' : 'You',
      message: 'Thank you for the quick response!',
      timestamp: new Date(Date.now() - 1800000),
      userType: userType,
    },
  ]);

  const incidentTypes = userType === 'user' 
    ? [
        { value: 'service_quality', label: 'Service Quality' },
        { value: 'officer_conduct', label: 'Officer Conduct' },
        { value: 'response_time', label: 'Response Time Issue' },
        { value: 'safety_concern', label: 'Safety Concern' },
        { value: 'property_damage', label: 'Property Damage' },
        { value: 'general_feedback', label: 'General Feedback' },
      ]
    : [
        { value: 'incident_report', label: 'Incident Report' },
        { value: 'suspicious_activity', label: 'Suspicious Activity' },
        { value: 'property_damage', label: 'Property Damage Observed' },
        { value: 'client_behavior', label: 'Client Behavior' },
        { value: 'safety_hazard', label: 'Safety Hazard' },
        { value: 'completion_report', label: 'Service Completion Report' },
      ];

  const handleSubmitReport = async () => {
    if (!incidentType || !description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the incident type and description.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const report: IncidentReport = {
        requestId,
        rating,
        incidentType,
        description,
        additionalComments,
        timestamp: new Date(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSubmit?.(report);

      toast({
        title: 'Report Submitted',
        description: 'Your incident report has been submitted successfully.',
      });

      // Reset form
      setRating(0);
      setIncidentType('');
      setDescription('');
      setAdditionalComments('');
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      message: newComment,
      timestamp: new Date(),
      userType: userType,
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');

    toast({
      title: 'Comment Added',
      description: 'Your comment has been posted.',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              {userType === 'user' ? 'Officer & Incident Report' : 'Incident Report'}
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-400">
              {requestId}
            </Badge>
          </div>
          <p className="text-white/60 text-sm mt-1">
            {userType === 'user' 
              ? `Report on ${officerName} - ${serviceType}`
              : `Service: ${serviceType}`
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Rating Section - Only for users */}
          {userType === 'user' && (
            <div className="space-y-2">
              <Label className="text-white/90">Rate the Officer</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-white/30'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-white/70 text-sm">
                    {rating}/5 stars
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Incident Type */}
          <div className="space-y-2">
            <Label className="text-white/90">Report Type</Label>
            <Select value={incidentType} onValueChange={setIncidentType}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {incidentTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-white/90">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                userType === 'user'
                  ? "Describe your experience with the officer and any incidents that occurred..."
                  : "Describe the incident and any relevant details..."
              }
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
            />
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <Label className="text-white/90">Additional Comments (Optional)</Label>
            <Textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Any additional information you'd like to add..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitReport}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-400" />
            Communication Thread
          </CardTitle>
          <p className="text-white/60 text-sm">
            Messages between {userType === 'user' ? 'you and the officer' : 'you and the client'}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Comments List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-lg ${
                  comment.userType === userType
                    ? 'bg-blue-500/20 ml-6'
                    : 'bg-white/5 mr-6'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {comment.userType === 'officer' ? (
                      <Shield className="h-4 w-4 text-blue-400" />
                    ) : (
                      <User className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-white/90 text-sm font-medium">
                      {comment.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-white/50 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatTime(comment.timestamp)}
                  </div>
                </div>
                <p className="text-white/80 text-sm">{comment.message}</p>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type a message..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentReportForm;
