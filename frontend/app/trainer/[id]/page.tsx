"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Star,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  Users,
  MessageCircle,
  Building,
} from "lucide-react"
import { UserNavbar } from "@/components/user-navbar"

export default function TrainerDetailPage({ params }: { params: { id: string } }) {
  // Comprehensive dummy trainers data
  const trainersData = {
    "1": {
      id: 1,
      name: "Sarah Johnson",
      specialization: "Weight Loss & Strength Training",
      rating: 4.9,
      reviews: 127,
      hourlyRate: 75,
      experience: "5 years",
      location: "Downtown, 2.1 km away",
      address: "123 Fitness Street, Downtown, City 12345",
      email: "sarah.johnson@fitnest.com",
      phone: "+1 (555) 123-4567",
      image: "/images/trainer-sarah.png",
      certifications: ["NASM-CPT", "Nutrition Specialist", "Weight Loss Specialist"],
      availability: "Available Today",
      bio: "Passionate about helping clients achieve sustainable weight loss and build strength. With over 5 years of experience, I've helped hundreds of clients transform their lives through personalized fitness programs and nutritional guidance. My approach combines evidence-based training methods with compassionate coaching to ensure lasting results.",
      registeredGyms: [
        { name: "FitZone Premium", address: "456 Gym Ave, Downtown" },
        { name: "Iron Paradise", address: "789 Strength St, Midtown" },
        { name: "Wellness Center", address: "321 Health Blvd, Uptown" },
      ],
      sessions: [
        { date: "2024-01-20", time: "09:00 AM", client: "John D.", type: "Weight Loss", status: "Completed" },
        { date: "2024-01-20", time: "11:00 AM", client: "Mary S.", type: "Strength Training", status: "Completed" },
        { date: "2024-01-21", time: "10:00 AM", client: "Mike R.", type: "Personal Training", status: "Scheduled" },
        { date: "2024-01-21", time: "02:00 PM", client: "Lisa K.", type: "Weight Loss", status: "Scheduled" },
        { date: "2024-01-22", time: "09:00 AM", client: "Available", type: "Open Slot", status: "Available" },
        { date: "2024-01-22", time: "03:00 PM", client: "Available", type: "Open Slot", status: "Available" },
      ],
      blogs: [
        {
          title: "10 Essential Tips for Sustainable Weight Loss",
          date: "2024-01-15",
          excerpt:
            "Discover the key principles that will help you lose weight and keep it off for good. Learn about creating a caloric deficit, the importance of protein, and building healthy habits...",
          readTime: "5 min read",
        },
        {
          title: "Building Strength: A Beginner's Guide",
          date: "2024-01-10",
          excerpt:
            "Learn the fundamentals of strength training and how to start your journey safely. From proper form to progressive overload, this guide covers everything you need to know...",
          readTime: "7 min read",
        },
        {
          title: "Nutrition Myths Debunked",
          date: "2024-01-05",
          excerpt:
            "Let's separate fact from fiction when it comes to popular nutrition beliefs. I'll address common misconceptions about carbs, fats, and meal timing...",
          readTime: "6 min read",
        },
      ],
      feedbacks: [
        {
          client: "John D.",
          rating: 5,
          date: "2024-01-18",
          comment:
            "Sarah is an amazing trainer! She helped me lose 20 pounds in 3 months and I feel stronger than ever. Her approach is both professional and motivating.",
        },
        {
          client: "Mary S.",
          rating: 5,
          date: "2024-01-15",
          comment:
            "Best investment I've made for my health. Sarah's knowledge of nutrition and exercise is incredible. Highly recommend!",
        },
        {
          client: "Mike R.",
          rating: 4,
          date: "2024-01-12",
          comment:
            "Great trainer with excellent communication skills. The workout plans are challenging but achievable.",
        },
        {
          client: "Lisa K.",
          rating: 5,
          date: "2024-01-10",
          comment:
            "Sarah transformed my relationship with fitness. She's patient, knowledgeable, and truly cares about her clients' success.",
        },
      ],
    },
    "2": {
      id: 2,
      name: "Mike Rodriguez",
      specialization: "Bodybuilding & Powerlifting",
      rating: 4.7,
      reviews: 89,
      hourlyRate: 85,
      experience: "8 years",
      location: "Midtown, 1.8 km away",
      address: "456 Power Street, Midtown, City 12345",
      email: "mike.rodriguez@fitnest.com",
      phone: "+1 (555) 234-5678",
      image: "/images/trainer-mike.png",
      certifications: ["ACSM-CPT", "Powerlifting Coach", "Sports Nutrition"],
      availability: "Available Tomorrow",
      bio: "Former competitive powerlifter with 8 years of experience specializing in strength and muscle building. I've competed at national level and now dedicate my expertise to helping others achieve their strength goals. Whether you're a beginner or advanced lifter, I'll help you build the physique and strength you've always wanted.",
      registeredGyms: [
        { name: "Muscle Factory", address: "789 Iron Ave, Midtown" },
        { name: "Power Gym", address: "321 Strength Blvd, Downtown" },
        { name: "Elite Fitness", address: "654 Muscle St, Uptown" },
      ],
      sessions: [
        { date: "2024-01-20", time: "08:00 AM", client: "Alex T.", type: "Powerlifting", status: "Completed" },
        { date: "2024-01-20", time: "10:00 AM", client: "Brad M.", type: "Bodybuilding", status: "Completed" },
        { date: "2024-01-21", time: "09:00 AM", client: "Chris L.", type: "Strength Training", status: "Scheduled" },
        { date: "2024-01-21", time: "01:00 PM", client: "David K.", type: "Powerlifting", status: "Scheduled" },
        { date: "2024-01-22", time: "10:00 AM", client: "Available", type: "Open Slot", status: "Available" },
      ],
      blogs: [
        {
          title: "The Science of Progressive Overload",
          date: "2024-01-12",
          excerpt:
            "Understanding how to progressively increase training stimulus is crucial for continuous gains. Learn the principles that drive muscle and strength development...",
          readTime: "8 min read",
        },
        {
          title: "Powerlifting vs Bodybuilding: Which is Right for You?",
          date: "2024-01-08",
          excerpt:
            "Explore the differences between powerlifting and bodybuilding training styles, and discover which approach aligns with your goals...",
          readTime: "6 min read",
        },
        {
          title: "Common Deadlift Mistakes and How to Fix Them",
          date: "2024-01-03",
          excerpt:
            "The deadlift is a fundamental movement, but it's often performed incorrectly. Here are the most common mistakes I see and how to correct them...",
          readTime: "7 min read",
        },
      ],
      feedbacks: [
        {
          client: "Alex T.",
          rating: 5,
          date: "2024-01-16",
          comment:
            "Mike helped me increase my deadlift by 50lbs in just 2 months. His technical knowledge is outstanding and he really knows how to push you safely.",
        },
        {
          client: "Brad M.",
          rating: 4,
          date: "2024-01-13",
          comment:
            "Great bodybuilding coach. Mike's programs are intense but effective. Gained 8lbs of muscle in 4 months.",
        },
        {
          client: "Chris L.",
          rating: 5,
          date: "2024-01-09",
          comment:
            "As a former competitor, Mike brings real experience to his coaching. His form corrections have prevented injuries and improved my lifts significantly.",
        },
      ],
    },
    "3": {
      id: 3,
      name: "Emily Chen",
      specialization: "Yoga & Flexibility",
      rating: 4.8,
      reviews: 156,
      hourlyRate: 65,
      experience: "6 years",
      location: "Uptown, 3.2 km away",
      address: "789 Zen Avenue, Uptown, City 12345",
      email: "emily.chen@fitnest.com",
      phone: "+1 (555) 345-6789",
      image: "/images/trainer-emily.png",
      certifications: ["RYT-500", "Pilates Instructor", "Meditation Teacher"],
      availability: "Available Today",
      bio: "Certified yoga instructor with 6 years of experience focused on mindfulness and body alignment. I believe in the transformative power of yoga to heal both body and mind. My classes blend traditional yoga philosophy with modern movement science to create a practice that's both grounding and challenging.",
      registeredGyms: [
        { name: "Zen Fitness", address: "123 Peace St, Uptown" },
        { name: "Harmony Studio", address: "456 Calm Ave, Midtown" },
        { name: "Mindful Movement", address: "789 Serenity Blvd, Downtown" },
      ],
      sessions: [
        { date: "2024-01-20", time: "07:00 AM", client: "Anna P.", type: "Vinyasa Yoga", status: "Completed" },
        { date: "2024-01-20", time: "12:00 PM", client: "Sophie R.", type: "Pilates", status: "Completed" },
        { date: "2024-01-21", time: "08:00 AM", client: "Grace M.", type: "Yin Yoga", status: "Scheduled" },
        { date: "2024-01-21", time: "05:00 PM", client: "Luna K.", type: "Meditation", status: "Scheduled" },
        { date: "2024-01-22", time: "07:00 AM", client: "Available", type: "Open Slot", status: "Available" },
        { date: "2024-01-22", time: "06:00 PM", client: "Available", type: "Open Slot", status: "Available" },
      ],
      blogs: [
        {
          title: "The Benefits of Daily Meditation Practice",
          date: "2024-01-14",
          excerpt:
            "Discover how just 10 minutes of daily meditation can transform your mental clarity, reduce stress, and improve overall well-being...",
          readTime: "5 min read",
        },
        {
          title: "Yoga for Beginners: Your First Steps",
          date: "2024-01-09",
          excerpt:
            "Starting a yoga practice can feel overwhelming. Here's your gentle guide to beginning your yoga journey with confidence and ease...",
          readTime: "6 min read",
        },
        {
          title: "Understanding the Eight Limbs of Yoga",
          date: "2024-01-04",
          excerpt:
            "Yoga is more than physical poses. Explore the philosophical foundation of yoga through the eight limbs and how they apply to modern life...",
          readTime: "9 min read",
        },
      ],
      feedbacks: [
        {
          client: "Anna P.",
          rating: 5,
          date: "2024-01-17",
          comment:
            "Emily's classes are transformative. Her gentle guidance helped me develop flexibility I never thought possible. The mindfulness aspect is life-changing.",
        },
        {
          client: "Sophie R.",
          rating: 5,
          date: "2024-01-14",
          comment:
            "Best yoga instructor I've worked with. Emily creates a safe, non-judgmental space where you can truly connect with your practice.",
        },
        {
          client: "Grace M.",
          rating: 4,
          date: "2024-01-11",
          comment:
            "Emily's knowledge of anatomy and alignment is impressive. Her cues are clear and helpful for improving form.",
        },
      ],
    },
    "4": {
      id: 4,
      name: "David Thompson",
      specialization: "HIIT & Cardio",
      rating: 4.6,
      reviews: 98,
      hourlyRate: 70,
      experience: "4 years",
      location: "Downtown, 1.5 km away",
      address: "321 Energy Street, Downtown, City 12345",
      email: "david.thompson@fitnest.com",
      phone: "+1 (555) 456-7890",
      image: "/images/trainer-david.png",
      certifications: ["HIIT Specialist", "Cardio Coach", "TRX Instructor"],
      availability: "Available This Week",
      bio: "High-energy trainer specializing in fat burning and cardiovascular fitness. I love creating dynamic, challenging workouts that keep you engaged and motivated. My HIIT sessions are designed to maximize calorie burn while building functional strength and endurance.",
      registeredGyms: [
        { name: "CardioMax", address: "456 Cardio Ave, Downtown" },
        { name: "FitZone Premium", address: "789 Energy St, Midtown" },
        { name: "Pulse Fitness", address: "123 Beat Blvd, Uptown" },
      ],
      sessions: [
        { date: "2024-01-20", time: "06:00 AM", client: "Jake S.", type: "HIIT", status: "Completed" },
        { date: "2024-01-20", time: "07:00 PM", client: "Emma L.", type: "Cardio Blast", status: "Completed" },
        { date: "2024-01-21", time: "06:30 AM", client: "Ryan M.", type: "TRX Training", status: "Scheduled" },
        { date: "2024-01-21", time: "07:30 PM", client: "Mia K.", type: "HIIT", status: "Scheduled" },
        { date: "2024-01-22", time: "06:00 AM", client: "Available", type: "Open Slot", status: "Available" },
      ],
      blogs: [
        {
          title: "HIIT vs Steady State: Which Burns More Fat?",
          date: "2024-01-13",
          excerpt:
            "Compare the benefits of high-intensity interval training versus traditional steady-state cardio for fat loss and fitness improvements...",
          readTime: "6 min read",
        },
        {
          title: "The Science Behind the Afterburn Effect",
          date: "2024-01-07",
          excerpt:
            "Learn how HIIT workouts continue burning calories long after your session ends, and how to maximize this metabolic advantage...",
          readTime: "5 min read",
        },
        {
          title: "Building Endurance Without Boring Cardio",
          date: "2024-01-02",
          excerpt:
            "Discover fun, engaging ways to build cardiovascular endurance that don't involve endless hours on the treadmill...",
          readTime: "7 min read",
        },
      ],
      feedbacks: [
        {
          client: "Jake S.",
          rating: 5,
          date: "2024-01-15",
          comment:
            "David's HIIT sessions are intense but incredibly effective. Lost 15lbs in 2 months and my endurance has improved dramatically.",
        },
        {
          client: "Emma L.",
          rating: 4,
          date: "2024-01-12",
          comment: "Great energy and motivation. David keeps the workouts fresh and challenging. Never a dull moment!",
        },
        {
          client: "Ryan M.",
          rating: 5,
          date: "2024-01-08",
          comment:
            "Perfect trainer for anyone looking to get in shape fast. David's programs are tough but he makes sure you can handle the intensity.",
        },
      ],
    },
    "5": {
      id: 5,
      name: "Lisa Martinez",
      specialization: "Rehabilitation & Recovery",
      rating: 4.9,
      reviews: 203,
      hourlyRate: 90,
      experience: "10 years",
      location: "Medical District, 4.1 km away",
      address: "654 Recovery Road, Medical District, City 12345",
      email: "lisa.martinez@fitnest.com",
      phone: "+1 (555) 567-8901",
      image: "/images/trainer-lisa.png",
      certifications: ["Physical Therapy", "Corrective Exercise", "Sports Medicine"],
      availability: "Booking Required",
      bio: "Licensed physical therapist with 10 years of experience specializing in injury recovery and prevention. I work with clients recovering from injuries, managing chronic pain, and those looking to move better in their daily lives. My approach combines therapeutic exercise with education to help you achieve lasting results.",
      registeredGyms: [
        { name: "Recovery Center", address: "123 Heal Ave, Medical District" },
        { name: "Wellness Hub", address: "456 Therapy St, Downtown" },
        { name: "Rehab Plus", address: "789 Recovery Blvd, Uptown" },
      ],
      sessions: [
        { date: "2024-01-20", time: "09:00 AM", client: "Robert K.", type: "Post-Surgery Rehab", status: "Completed" },
        { date: "2024-01-20", time: "02:00 PM", client: "Helen M.", type: "Back Pain Management", status: "Completed" },
        { date: "2024-01-21", time: "10:00 AM", client: "Tom R.", type: "Shoulder Rehab", status: "Scheduled" },
        { date: "2024-01-21", time: "03:00 PM", client: "Carol S.", type: "Movement Assessment", status: "Scheduled" },
        { date: "2024-01-22", time: "11:00 AM", client: "Available", type: "Consultation", status: "Available" },
      ],
      blogs: [
        {
          title: "Understanding Lower Back Pain: Causes and Solutions",
          date: "2024-01-16",
          excerpt:
            "Explore the common causes of lower back pain and evidence-based approaches to treatment and prevention...",
          readTime: "10 min read",
        },
        {
          title: "The Importance of Movement Quality Over Quantity",
          date: "2024-01-11",
          excerpt:
            "Learn why how you move matters more than how much you move, and how to assess and improve your movement patterns...",
          readTime: "8 min read",
        },
        {
          title: "Returning to Exercise After Injury: A Safe Approach",
          date: "2024-01-06",
          excerpt:
            "Guidelines for safely returning to physical activity after injury, including when to seek professional help...",
          readTime: "9 min read",
        },
      ],
      feedbacks: [
        {
          client: "Robert K.",
          rating: 5,
          date: "2024-01-18",
          comment:
            "Lisa helped me recover from knee surgery faster than expected. Her expertise and caring approach made all the difference in my rehabilitation.",
        },
        {
          client: "Helen M.",
          rating: 5,
          date: "2024-01-15",
          comment:
            "After years of chronic back pain, Lisa's program finally gave me relief. She's incredibly knowledgeable and patient.",
        },
        {
          client: "Tom R.",
          rating: 5,
          date: "2024-01-12",
          comment:
            "Professional, thorough, and effective. Lisa's treatment plan got me back to playing tennis pain-free.",
        },
      ],
    },
    "6": {
      id: 6,
      name: "Alex Kim",
      specialization: "CrossFit & Functional Training",
      rating: 4.7,
      reviews: 134,
      hourlyRate: 80,
      experience: "7 years",
      location: "Sports Complex, 2.8 km away",
      address: "987 Athletic Drive, Sports Complex, City 12345",
      email: "alex.kim@fitnest.com",
      phone: "+1 (555) 678-9012",
      image: "/images/trainer-alex.png",
      certifications: ["CrossFit Level 2", "Functional Movement", "Olympic Lifting"],
      availability: "Available Today",
      bio: "CrossFit athlete and coach with 7 years of experience focused on functional movement patterns. I believe fitness should prepare you for life's challenges. My training emphasizes compound movements, varied workouts, and building both physical and mental resilience.",
      registeredGyms: [
        { name: "CrossFit Box", address: "123 WOD St, Sports Complex" },
        { name: "Functional Fitness", address: "456 Movement Ave, Downtown" },
        { name: "Athletic Performance", address: "789 Training Blvd, Midtown" },
      ],
      sessions: [
        { date: "2024-01-20", time: "05:30 AM", client: "Marcus T.", type: "CrossFit WOD", status: "Completed" },
        { date: "2024-01-20", time: "06:00 PM", client: "Nina L.", type: "Olympic Lifting", status: "Completed" },
        { date: "2024-01-21", time: "05:30 AM", client: "Tyler M.", type: "Functional Training", status: "Scheduled" },
        { date: "2024-01-21", time: "06:30 PM", client: "Zoe K.", type: "CrossFit Basics", status: "Scheduled" },
        { date: "2024-01-22", time: "05:30 AM", client: "Available", type: "Open Slot", status: "Available" },
      ],
      blogs: [
        {
          title: "CrossFit for Beginners: What to Expect",
          date: "2024-01-15",
          excerpt:
            "New to CrossFit? Here's everything you need to know about starting your functional fitness journey safely and effectively...",
          readTime: "7 min read",
        },
        {
          title: "The Benefits of Functional Movement Training",
          date: "2024-01-10",
          excerpt:
            "Discover how functional movement patterns can improve your daily life performance and reduce injury risk...",
          readTime: "6 min read",
        },
        {
          title: "Olympic Lifting Technique: Clean and Jerk Basics",
          date: "2024-01-05",
          excerpt:
            "Master the fundamentals of the clean and jerk with this comprehensive technique guide for beginners...",
          readTime: "8 min read",
        },
      ],
      feedbacks: [
        {
          client: "Marcus T.",
          rating: 5,
          date: "2024-01-17",
          comment:
            "Alex is an amazing CrossFit coach. His attention to form and safety while pushing you to your limits is exactly what I needed.",
        },
        {
          client: "Nina L.",
          rating: 4,
          date: "2024-01-14",
          comment:
            "Great Olympic lifting coach. Alex broke down complex movements into manageable steps. My technique has improved significantly.",
        },
        {
          client: "Tyler M.",
          rating: 5,
          date: "2024-01-11",
          comment:
            "Alex creates challenging but scalable workouts. As a former athlete, his programming helped me get back in competitive shape.",
        },
      ],
    },
  }

  // Get trainer data based on ID, fallback to trainer 1 if not found
  const trainer = trainersData[params.id as keyof typeof trainersData] || trainersData["1"]

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />

      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Image and Basic Info */}
            <div className="lg:w-1/3">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Avatar className="h-32 w-32 mx-auto mb-4">
                      <AvatarImage src={trainer.image || "/placeholder.svg"} alt={trainer.name} />
                      <AvatarFallback className="text-2xl">
                        {trainer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold mb-2 text-white">{trainer.name}</h1>
                    <p className="text-muted-foreground mb-4">{trainer.specialization}</p>

                    <div className="flex justify-center items-center mb-4">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-semibold text-white mr-2">{trainer.rating}</span>
                      <span className="text-muted-foreground">({trainer.reviews} reviews)</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <Badge className="bg-primary text-white text-lg px-4 py-2">
                        <DollarSign className="h-4 w-4 mr-1" />${trainer.hourlyRate}/hour
                      </Badge>
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        {trainer.availability}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Session
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/3">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="gyms">Gyms</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="blogs">Blogs</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Contact Information */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-white">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="text-white">{trainer.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span className="text-white">{trainer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-white">{trainer.address}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* About */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-white">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{trainer.bio}</p>
                    </CardContent>
                  </Card>

                  {/* Certifications */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Award className="mr-2 h-5 w-5" />
                        Certifications & Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-white mb-2">Experience: {trainer.experience}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {trainer.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="gyms" className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Building className="mr-2 h-5 w-5" />
                        Registered Gyms
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Gyms where {trainer.name} provides training services
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {trainer.registeredGyms.map((gym, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div>
                              <h3 className="font-semibold text-white">{gym.name}</h3>
                              <p className="text-sm text-muted-foreground">{gym.address}</p>
                            </div>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              View Gym
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Clock className="mr-2 h-5 w-5" />
                        Training Sessions
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Recent and upcoming training sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {trainer.sessions.map((session, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-semibold text-white">{session.date}</p>
                                <p className="text-sm text-muted-foreground">{session.time}</p>
                              </div>
                              <div>
                                <p className="text-white">{session.client}</p>
                                <p className="text-sm text-muted-foreground">{session.type}</p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                session.status === "Completed"
                                  ? "secondary"
                                  : session.status === "Scheduled"
                                    ? "default"
                                    : "outline"
                              }
                              className={session.status === "Available" ? "bg-green-500 text-white" : ""}
                            >
                              {session.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="blogs" className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-white">Latest Blogs</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Fitness tips and insights from {trainer.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {trainer.blogs.map((blog, index) => (
                          <div key={index} className="border-b border-border pb-4 last:border-b-0">
                            <h3 className="font-semibold text-white mb-2">{blog.title}</h3>
                            <p className="text-muted-foreground mb-2">{blog.excerpt}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{blog.date}</span>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-muted-foreground">{blog.readTime}</span>
                                <Button variant="outline" size="sm" className="bg-transparent">
                                  Read More
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Users className="mr-2 h-5 w-5" />
                        Client Reviews
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        What clients say about {trainer.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {trainer.feedbacks.map((feedback, index) => (
                          <div key={index} className="border-b border-border pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{feedback.client[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-white">{feedback.client}</p>
                                  <p className="text-sm text-muted-foreground">{feedback.date}</p>
                                </div>
                              </div>
                              <div className="flex">
                                {[...Array(feedback.rating)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{feedback.comment}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
