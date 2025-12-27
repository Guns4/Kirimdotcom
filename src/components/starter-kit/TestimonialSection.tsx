'use client';

import { Star } from 'lucide-react';

interface Testimonial {
    id: string;
    customer_name: string;
    customer_role: string;
    rating: number;
    review_text: string;
    customer_avatar_url?: string;
}

interface TestimonialSectionProps {
    testimonials: Testimonial[];
}

export default function TestimonialSection({ testimonials }: TestimonialSectionProps) {
    return (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Apa Kata Mereka? 🎉
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Ribuan seller sudah membuktikan hasilnya
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                        >
                            {/* Rating Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < testimonial.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Review Text */}
                            <p className="text-gray-700 mb-6 leading-relaxed">
                                &ldquo;{testimonial.review_text}&rdquo;
                            </p>

                            {/* Customer Info */}
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    {testimonial.customer_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {testimonial.customer_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {testimonial.customer_role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Badge */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">100% Review Asli dari Customer Kami</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
