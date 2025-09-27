import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BoxLoader from '@/components/ui/BoxLoader';
import { 
  ChefHat, 
  Users, 
  Github,
  ArrowRight,
  Truck,
  Utensils,
  Star,
  MapPin,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'register' | 'login' | null>(null);

  const teamMembers = [
    {
      name: "Hitesh H",
      github: "https://github.com/hitesh009911",
      avatar: "https://avatars.githubusercontent.com/u/90308743?v=4", 
    },
    {
      name: "Sanjana Messi",
      github: "https://github.com/sanjana08-lab",
      avatar: "https://avatars.githubusercontent.com/u/174131105?v=4",
    },
    {
      name: "Mohith C M",
      github: "https://github.com/mohithcm",
      avatar: "https://avatars.githubusercontent.com/u/139070250?v=4",
    },
    {
      name: "Asmita Singh",
      github: "#",
      avatar: "https://github.com/asmita.png",
    }
  ];

  const features = [
    {
      icon: Utensils,
      title: "For Customers",
      description: "Order from your favorite restaurants with real-time tracking and instant delivery.",
      highlight: "30min delivery"
    },
    {
      icon: ChefHat,
      title: "For Restaurants", 
      description: "Manage your menu, orders, and delivery status with our comprehensive dashboard.",
      highlight: "Easy management"
    },
    {
      icon: Truck,
      title: "For Delivery Agents",
      description: "Join our delivery team and start earning with flexible schedules and competitive rates.",
      highlight: "Flexible hours"
    }
  ];

  const handleProfileClick = (githubUrl: string) => {
    if (githubUrl !== "#") {
      window.open(githubUrl, '_blank');
    }
  };

  const handleRegisterClick = () => {
    setIsLoading(true);
    setLoadingType('register');
    // Simulate loading time
    setTimeout(() => {
      navigate('/register');
    }, 4000);
  };

  const handleLoginClick = () => {
    setIsLoading(true);
    setLoadingType('login');
    // Simulate loading time
    setTimeout(() => {
      navigate('/login');
    }, 4000);
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-accent via-background to-primary/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,_hsl(var(--primary-glow)/0.05)_0%,_transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(var(--secondary)/0.08)_0%,_transparent_50%)] -z-10" />

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6">
              <BoxLoader />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white text-lg font-medium"
            >
              {loadingType === 'register' ? 'Preparing your account...' : 'Signing you in...'}
            </motion.p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <header className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-12"
            >
              <div className="w-24 h-24 feature-icon rounded-2xl flex items-center justify-center">
                <ChefHat className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-6xl md:text-7xl font-black text-foreground mb-8 tracking-tight"
            >
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GrubStack
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Your ultimate food delivery platform connecting restaurants, customers, and delivery agents in one seamless experience.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 150 }}
              className="flex justify-center"
            >
              <Button
                size="lg"
                onClick={handleRegisterClick}
                disabled={isLoading}
                className="hero-button px-10 py-6 text-xl rounded-2xl group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Utensils className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                Grub Your Food
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GrubStack?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of food delivery with our innovative platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="glass-card h-full p-8 text-center hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-0">
                    <div className="w-20 h-20 feature-icon rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      {feature.highlight}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Meet Our{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Team
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The talented developers behind GrubStack's innovative platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card 
                  className="team-card glass-card cursor-pointer border-2 hover:border-primary/20"
                  onClick={() => handleProfileClick(member.github)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 transition-all duration-300">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f97316&color=fff&size=96`;
                          }}
                        />
                      </div>
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg"
                      >
                        <Github className="h-4 w-4 text-white" />
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {member.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Developer
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_hsl(0_0%_0%/0.1)_100%)]" />
        
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8"
            >
              <ChefHat className="h-10 w-10 text-white" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users who trust GrubStack for their food delivery needs. Experience seamless ordering, quick delivery, and exceptional service.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                onClick={handleRegisterClick}
                disabled={isLoading}
                className="bg-white text-primary hover:bg-white/90 px-10 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users className="mr-3 h-6 w-6" />
                Sign Up Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleLoginClick}
                disabled={isLoading}
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-6 text-xl font-bold rounded-2xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Already have an account? Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex justify-center mb-8"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4">GrubStack</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Connecting food lovers with their favorite restaurants through innovative technology and exceptional service.
              </p>
              
              <div className="h-px bg-border mb-8" />
              
              <p className="text-muted-foreground">
                © 2025 GrubStack. Made with{' '}
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-red-500"
                >
                  ❤️
                </motion.span>
                {' '}by our amazing team.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;