import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTrello } from '../contexts/TrelloContext';
import toast from 'react-hot-toast';
import BoardSelector from '../components/BoardSelector';
import ListSelector from '../components/ListSelector';
import LabelSelector from '../components/LabelSelector';
import MemberSelector from '../components/MemberSelector';

const { FiPlus, FiSave, FiAlertCircle, FiArrowLeft } = FiIcons;

const CreateCard = () => {
  const navigate = useNavigate();
  const { connected, createCard, selectedBoard } = useTrello();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      boardId: '',
      listId: '',
      labelIds: [],
      assigneeId: '',
      dueDate: ''
    }
  });

  const watchedTitle = watch('title');
  const watchedDescription = watch('description');

  useEffect(() => {
    if (!connected) {
      navigate('/settings');
      toast.error('Please connect to Trello first');
    }
  }, [connected, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const cardData = {
        title: data.title.trim(),
        description: data.description.trim(),
        listId: data.listId,
        labelIds: data.labelIds || [],
        assigneeId: data.assigneeId || null,
        dueDate: data.dueDate || null
      };

      const result = await createCard(cardData);
      
      toast.success('Card created successfully!');
      
      // Show success with card URL
      setTimeout(() => {
        if (window.confirm('Card created! Would you like to view it in Trello?')) {
          window.open(result.url, '_blank');
        }
      }, 500);
      
      // Reset form
      setValue('title', '');
      setValue('description', '');
      setValue('labelIds', []);
      setValue('assigneeId', '');
      setValue('dueDate', '');
      
    } catch (error) {
      toast.error(error.message || 'Failed to create card');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Connected</h2>
        <p className="text-gray-600">Please connect to Trello to create cards</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Trello Card</h1>
          <p className="text-gray-600 mt-1">Create a new card from AI-generated content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Card Content</h2>
              
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Card Title *
                </label>
                <input
                  {...register('title', { 
                    required: 'Title is required',
                    maxLength: { value: 512, message: 'Title must be less than 512 characters' }
                  })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter card title..."
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  {watchedTitle.length}/512 characters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Card Description *
                </label>
                <textarea
                  {...register('description', { 
                    required: 'Description is required',
                    maxLength: { value: 10000, message: 'Description must be less than 10,000 characters' }
                  })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter card description..."
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  {watchedDescription.length}/10,000 characters
                </p>
              </div>
            </div>

            {/* Board & List Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Destination</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BoardSelector
                  register={register}
                  errors={errors}
                  setValue={setValue}
                />
                <ListSelector
                  register={register}
                  errors={errors}
                  setValue={setValue}
                />
              </div>
            </div>

            {/* Optional Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Optional Settings</h2>
              
              <div className="space-y-4">
                <LabelSelector
                  register={register}
                  setValue={setValue}
                />
                
                <MemberSelector
                  register={register}
                  setValue={setValue}
                />

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    {...register('dueDate')}
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SafeIcon icon={isSubmitting ? FiSave : FiPlus} className="w-5 h-5" />
                <span>{isSubmitting ? 'Creating...' : 'Create Card'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Title</h4>
                <p className="text-sm text-gray-600">
                  {watchedTitle || 'Card title will appear here...'}
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 text-sm mb-1">Description</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {watchedDescription || 'Card description will appear here...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCard;