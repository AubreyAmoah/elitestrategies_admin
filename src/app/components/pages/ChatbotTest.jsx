"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_URL;

export default function QATestingInterface() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleTest = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/chatbot/test`,
        { message: query },
        { withCredentials: true }
      );

      setResults(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to test query");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5" />
            QA Pair Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTest} className="mb-6">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a test question..."
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Test
              </Button>
            </div>
          </form>

          {results && (
            <div className="space-y-4">
              {/* Response Section */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Response</h3>
                <p>{results.message}</p>
                <Badge
                  className={`mt-2 ${getConfidenceColor(results.confidence)}`}
                >
                  Confidence: {Math.round(results.confidence * 100)}%
                </Badge>
              </div>

              {/* Analysis Section */}
              <Accordion type="single" collapsible>
                <AccordionItem value="analysis">
                  <AccordionTrigger>Analysis Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {/* Intent Detection */}
                      <div>
                        <h4 className="font-semibold mb-2">Detected Intents</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.analysis.intents.map((intent, index) => (
                            <Badge key={index} variant="secondary">
                              {intent}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Key Phrases */}
                      <div>
                        <h4 className="font-semibold mb-2">Key Phrases</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.analysis.keyPhrases.map((phrase, index) => (
                            <Badge key={index} variant="outline">
                              {phrase}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Entities */}
                      <div>
                        <h4 className="font-semibold mb-2">
                          Identified Entities
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(results.analysis.entities).map(
                            ([type, entities]) => (
                              <div key={type}>
                                <span className="text-sm text-gray-600">
                                  {type}:
                                </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {entities.map((entity, index) => (
                                    <Badge key={index} variant="secondary">
                                      {entity}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Matched QA Pairs */}
                      <div>
                        <h4 className="font-semibold mb-2">
                          Top Matching QA Pairs
                        </h4>
                        <ScrollArea className="h-48 rounded-md border p-2">
                          {results.matches.map((match, index) => (
                            <div
                              key={index}
                              className="border-b last:border-0 py-2"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    Q: {match.question}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    A: {match.answer}
                                  </p>
                                </div>
                                <Badge
                                  className={getConfidenceColor(match.score)}
                                >
                                  {Math.round(match.score * 100)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Suggestions */}
              {results.confidence < 0.6 && (
                <Alert>
                  <AlertDescription>
                    <h4 className="font-semibold mb-2">Suggestions:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Try rephrasing your question</li>
                      <li>Use more specific keywords</li>
                      <li>
                        Check if similar questions exist in your QA database
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
