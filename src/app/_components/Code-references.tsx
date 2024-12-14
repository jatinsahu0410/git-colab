import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { lucario, materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import React, { useState } from 'react';

type Props = {
    fileReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const CodeReference = ({ fileReferences }: Props) => {
    const [tab, setTab] = useState(fileReferences[0]?.fileName);

    return (
        <div className="max-w-[75vw] h-full">
            <Tabs value={tab} onValueChange={setTab}>
                {/* Tabs for file names */}
                <div className="overflow-x-auto flex gap-2 bg-gray-200 p-1 rounded-md">
                    {fileReferences.map((file) => (
                        <button
                            key={file.fileName}
                            onClick={() => setTab(file.fileName)}
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-muted-foreground',
                                {
                                    'bg-primary text-primary-foreground': tab === file.fileName,
                                }
                            )}
                        >
                            {file.fileName}
                        </button>
                    ))}
                </div>

                {/* Code Display */}
                {fileReferences.map((file) => (
                    <TabsContent
                        key={file.fileName}
                        value={file.fileName}
                        className="pb-2 overflow-y-auto"
                    >
                        {/* Summary Section */}
                        <div className="flex items-center gap-4 mb-4 bg-blue-50 p-3 rounded-md border border-blue-200">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
                                alt="File Icon"
                                className="w-8 h-8"
                            />
                            <div>
                                <h3 className="text-lg font-semibold text-blue-600">{file.fileName}</h3>
                                <p className="text-sm text-gray-500">{file.summary}</p>
                            </div>
                        </div>
                        <div className="whitespace-pre-wrap break-words rounded-md p-4 bg-gray-900 text-white">
                            <SyntaxHighlighter
                                language="typescript"
                                style={materialDark}
                                wrapLongLines={true} // Ensures long lines wrap correctly
                                customStyle={{
                                    background: 'none', // Matches container background
                                    padding: '0',
                                    margin: '0',
                                    overflowX: 'hidden', // Removes horizontal scrolling
                                }}
                                codeTagProps={{
                                    style: { wordWrap: 'break-word', whiteSpace: 'pre-wrap' }, // Ensures wrapping
                                }}
                            >
                                {file.sourceCode}
                            </SyntaxHighlighter>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default CodeReference;
