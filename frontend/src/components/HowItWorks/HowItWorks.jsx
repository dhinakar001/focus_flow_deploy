/**
 * How It Works Page
 * 
 * Explains how FocusFlow works with step-by-step guide
 * 
 * @module components/HowItWorks/HowItWorks
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Target,
  Zap,
  Brain,
  BarChart3,
  MessageSquare,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Connect to Zoho Cliq',
    description: 'Authorize FocusFlow with your Zoho Cliq account using OAuth 2.0. Your credentials are encrypted and stored securely.',
    icon: Shield,
    color: 'primary',
  },
  {
    id: 2,
    title: 'Set Your Focus Mode',
    description: 'Choose from predefined focus modes or create custom ones. Set duration, preferences, and notification rules.',
    icon: Target,
    color: 'primary',
  },
  {
    id: 3,
    title: 'Start Focus Session',
    description: 'Activate focus mode with one click. FocusFlow automatically blocks distracting messages during your session.',
    icon: PlayCircle,
    color: 'success',
  },
  {
    id: 4,
    title: 'AI-Powered Insights',
    description: 'Get smart suggestions from our AI Focus Coach. Analyze your patterns and optimize your productivity.',
    icon: Brain,
    color: 'accent',
  },
  {
    id: 5,
    title: 'Track Your Progress',
    description: 'View detailed analytics, streaks, and productivity metrics. See how focus time impacts your work.',
    icon: BarChart3,
    color: 'primary',
  },
  {
    id: 6,
    title: 'Review Missed Messages',
    description: 'After your focus session, review all blocked messages in one place. Never miss important communications.',
    icon: MessageSquare,
    color: 'warning',
  },
];

const features = [
  {
    title: 'Automatic Message Blocking',
    description: 'Messages are automatically blocked during focus sessions based on your preferences.',
    icon: Zap,
  },
  {
    title: 'Smart Scheduling',
    description: 'AI suggests optimal focus times based on your work patterns and calendar.',
    icon: Clock,
  },
  {
    title: 'Real-time Analytics',
    description: 'Track your productivity in real-time with detailed metrics and insights.',
    icon: BarChart3,
  },
  {
    title: 'Team Coordination',
    description: 'Share your focus status with your team to reduce interruptions.',
    icon: MessageSquare,
  },
];

export default function HowItWorks({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-neutral-900">How FocusFlow Works</h1>
            <Button variant="ghost" onClick={onBack || (() => window.history.back())}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4" variant="primary">
            Getting Started
          </Badge>
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">
            FocusFlow: Your AI-Powered Productivity Partner
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            FocusFlow integrates seamlessly with Zoho Cliq to help you stay focused, 
            block distractions, and optimize your workflow through intelligent focus mode management.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
          How It Works in 6 Simple Steps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  step.color === 'primary' ? 'bg-primary-600' :
                  step.color === 'success' ? 'bg-success-600' :
                  step.color === 'accent' ? 'bg-accent-600' :
                  'bg-primary-600'
                }`} />
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      step.color === 'primary' ? 'bg-primary-100' :
                      step.color === 'success' ? 'bg-success-100' :
                      step.color === 'accent' ? 'bg-accent-100' :
                      'bg-primary-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        step.color === 'primary' ? 'text-primary-600' :
                        step.color === 'success' ? 'text-success-600' :
                        step.color === 'accent' ? 'text-accent-600' :
                        'text-primary-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Step {step.id}</CardTitle>
                        {index < steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-neutral-400 hidden lg:block" />
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base font-medium text-neutral-900">
                    {step.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
          Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-neutral-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-neutral-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
              Why FocusFlow?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Reduce context switching by up to 70%',
                'Increase focus time by 40%',
                'Block distractions automatically',
                'Get AI-powered productivity insights',
                'Track your progress with detailed analytics',
                'Never miss important messages',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success-600 flex-shrink-0" />
                  <span className="text-neutral-700">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-neutral-600 mb-6">
              Connect your Zoho Cliq account and start your first focus session today.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" size="lg">
                Connect Zoho Cliq
              </Button>
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

