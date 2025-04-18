import React, { useState, useEffect } from "react";
import { Card, Tag, Tooltip, Typography, Empty, message, Button, Modal } from "antd";
import {
  FiMenu,
  FiTarget,
  FiFlag,
  FiDatabase,
  FiTag,
  FiPlus
} from "react-icons/fi";
import { useGetLeadsQuery, useUpdateLeadMutation } from './services/LeadApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { setStageOrder, selectStageOrder } from '../crmsystem/leadstage/services/leadStageSlice';
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { useNavigate } from "react-router-dom";
import { CSS } from '@dnd-kit/utilities';
import { useGetSourcesQuery, useGetCategoriesQuery, useGetStatusesQuery } from '../crmsystem/souce/services/SourceApi';
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import { createPortal } from 'react-dom';
import AddLeadStageModal from "../crmsystem/leadstage/AddLeadStageModal";
import { formatCurrency } from '../../../utils/currencyUtils';
const { Text } = Typography;

// Add this function near the top with other helper functions
const getInterestLevel = (level) => {
  const levels = {
    "high": {
      color: "#52c41a",
      bg: "rgba(82, 196, 26, 0.1)",
      border: "#b7eb8f",
      text: "High Interest"
    },
    "medium": {
      color: "#faad14",
      bg: "rgba(250, 173, 20, 0.1)",
      border: "#ffd591",
      text: "Medium Interest"
    },
    "low": {
      color: "#ff4d4f",
      bg: "rgba(255, 77, 79, 0.1)",
      border: "#ffa39e",
      text: "Low Interest"
    }
  };
  return levels[level] || levels.medium;
};

const DraggableCard = ({ lead, stage, currencies = [], onLeadClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: {
      type: 'card',
      lead
    }
  });

  const handleCardClick = (e) => {
    if (isDragging) return;
    if (onLeadClick) {
      onLeadClick(lead);
    }
  };

  const { data: sourceData } = useGetSourcesQuery(lead.client_id);
  const { data: categoryData } = useGetCategoriesQuery(lead.client_id);
  const { data: statusesData } = useGetStatusesQuery(lead.client_id);

  const source = sourceData?.data?.find(s => s.id === lead.source);
  const category = categoryData?.data?.find(c => c.id === lead.category);
  const status = statusesData?.data?.find(s => s.id === lead.status);

  const cardContent = (
    <Card
      className="lead-card"
      bordered={false}
      onClick={handleCardClick}
      style={{
        borderRadius: '8px',
        background: lead.is_converted ? '#f8fafc' : '#ffffff',
        cursor: lead.is_converted ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging
          ? '0 12px 24px rgba(0, 0, 0, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        zIndex: isDragging ? 1200 : 1,
        overflow: 'hidden',
        opacity: lead.is_converted ? 0.85 : 1
      }}
    >
      {/* Interest Level Top Indicator */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '3px',
        background: getInterestLevel(lead.interest_level).color,
        opacity: 0.9
      }} />

      <div className="card-content" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Top Row with Status and Interest Level */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '-4px'
        }}>
          {/* Converted/Active Status */}
          <div style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: lead.is_converted ? '#dcfce7' : '#dbeafe',
            color: lead.is_converted ? '#15803d' : '#1e40af',
            fontWeight: '500',
            lineHeight: '14px'
          }}>
            <div style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'currentColor'
            }} />
            {lead.is_converted ? 'Converted' : 'Active'}
          </div>

          {/* Interest Level Badge */}
          <div style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: getInterestLevel(lead.interest_level).color,
            color: '#ffffff',
            fontWeight: '500',
            lineHeight: '14px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            {getInterestLevel(lead.interest_level).text}
          </div>
        </div>

        {/* Title Section */}
        <div className="title-section" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tooltip title={lead?.leadTitle}>
              <Text strong className="lead-title" style={{
                fontSize: '14px',
                lineHeight: '1.4',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#1f2937'
              }}>
                {lead?.leadTitle}
              </Text>
            </Tooltip>
            {lead?.company_name && (
              <Text className="company-name" style={{
                fontSize: '12px',
                color: '#64748b',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: '2px'
              }}>
                {lead.company_name}
              </Text>
            )}
          </div>
          {/* Value Tag */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f0fdf4',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid #dcfce7',
            height: '20px'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#16a34a',
              whiteSpace: 'nowrap'
            }}>
              {formatCurrency(lead.leadValue, lead.currency, currencies)}
            </span>
          </div>
        </div>

        {/* Bottom Info Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: '#f8fafc',
          margin: '0 -14px -12px -16px',
          padding: '8px 16px',
          borderTop: '1px solid #e2e8f0'
        }}>
          {/* Tags Row */}
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Status Tag */}
            {status && (
              <Tooltip title={`Status: ${status.name}`}>
                <Tag style={{
                  margin: 0,
                  padding: '2px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  lineHeight: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'default'
                }}>
                  <FiFlag style={{ fontSize: '10px' }} />
                  {status.name}
                </Tag>
              </Tooltip>
            )}

            {/* Source Tag */}
            {source && (
              <Tooltip title={`Source: ${source.name}`}>
                <Tag style={{
                  margin: 0,
                  padding: '2px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  background: '#eff6ff',
                  color: '#3b82f6',
                  border: '1px solid #bfdbfe',
                  lineHeight: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'default'
                }}>
                  <FiDatabase style={{ fontSize: '10px' }} />
                  {source.name}
                </Tag>
              </Tooltip>
            )}

            {/* Category Tag */}
            {category && (
              <Tooltip title={`Category: ${category.name}`}>
                <Tag style={{
                  margin: 0,
                  padding: '2px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  background: '#ecfeff',
                  color: '#0891b2',
                  border: '1px solid #bae6fd',
                  lineHeight: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'default'
                }}>
                  <FiTag style={{ fontSize: '10px' }} />
                  {category.name}
                </Tag>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const draggableProps = lead.is_converted ? {} : { ...attributes, ...listeners };

  if (isDragging) {
    return createPortal(
      <div
        ref={setNodeRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999999,
          width: '350px',
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
          opacity: 0.95,
          pointerEvents: 'none',
          cursor: 'grabbing',
          transformOrigin: '0 0',
          willChange: 'transform',
          transition: 'none'
        }}
        {...draggableProps}
      >
        {cardContent}
      </div>,
      document.body
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'relative',
        transform: 'translate3d(0, 0, 0)',
        touchAction: 'none',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
      {...draggableProps}
    >
      {cardContent}
    </div>
  );
};

const DroppableColumn = ({ stage, leads, isColumnDragging }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const { data: currencies = [] } = useGetAllCurrenciesQuery();

  return (
    <div
      ref={setNodeRef}
      className="kanban-column-content"
      style={{
        padding: '8px',
        maxHeight: 'calc(100vh - 240px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: isOver ? 'rgba(240, 247, 255, 0.8)' : 'transparent',
        borderRadius: '0 0 8px 8px',
        width: '350px',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        willChange: 'background-color'
      }}
    >
      <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
        {leads.length > 0 ? (
          leads.map((lead) => (
            <DraggableCard
              key={lead.id}
              lead={lead}
              stage={stage}
              currencies={currencies}
              onLeadClick={(lead) => {
                console.log('Lead clicked:', lead);
              }}
            />
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No leads"
          />
        )}
      </SortableContext>
    </div>
  );
};

const SortableColumn = ({ stage, leads, children, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({
    id: `column-${stage.id}`,
    data: {
      type: 'column',
      stage
    }
  });

  const { data: currencies = [] } = useGetAllCurrenciesQuery();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
    zIndex: isDragging ? 999 : 1,
    position: 'relative',
    width: '350px',
    minWidth: '350px',
    willChange: 'transform'
  };

  return (
    <div ref={setNodeRef} style={style} className={`kanban-column ${isDragging ? 'is-dragging' : ''}`}>
      <div className="kanban-column-inner" style={{
        background: '#ffffff',
        borderRadius: '8px',
        height: '100%',
        width: '100%',
        boxShadow: isDragging
          ? '0 8px 16px rgba(0, 0, 0, 0.08)'
          : '0 1px 3px rgba(0, 0, 0, 0.08)',
        transition: 'box-shadow 0.2s ease',
        position: 'relative',
        zIndex: 1
      }}>
        <div
          className="column-header"
          {...attributes}
          {...listeners}
          style={{
            padding: '16px 12px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            background: '#ffffff',
            userSelect: 'none'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            maxWidth: '60%'
          }}>
            <Tag color="blue" style={{
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '0 3px',
              height: '16px',
              lineHeight: '16px',
              marginRight: '4px',
              flexShrink: 0,
              minWidth: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '3px'
            }}>
              {index + 1}
            </Tag>
            <FiMenu style={{
              fontSize: '14px',
              color: '#6B7280',
              flexShrink: 0,
              marginRight: '4px'
            }} />
            <Tooltip title={stage.stageName}>
              <Text strong style={{
                fontSize: '13px',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}>{stage.stageName}</Text>
            </Tooltip>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f0fdf4',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #dcfce7'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#16a34a',
                whiteSpace: 'nowrap'
              }}>
                {leads.reduce((sum, lead) => {
                  const value = parseFloat(lead.leadValue) || 0;
                  const currencyDetails = currencies?.find(c => c.id === lead.currency);
                  return `${currencyDetails?.currencyIcon || '₹'}${value.toLocaleString('en-IN')}`;
                }, '')}
              </span>
            </div>
            <Tag style={{
              minWidth: '20px',
              marginLeft: '4px',
              fontSize: '11px',
              padding: '0 4px',
              background: '#f3f4f6',
              color: '#4b5563',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {(leads || []).length}
            </Tag>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

const LeadCard = ({ currencies, countries, sourcesData, statusesData, categoriesData }) => {
  const { data: leadsData, isLoading: isLoadingLeads, error: errorLeads } = useGetLeadsQuery();
  const { data: stageQueryData, isLoading: isLoadingStages, error: errorStages, refetch: refetchStages } = useGetLeadStagesQuery();
  const [updateLead] = useUpdateLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const savedStageOrder = useSelector(selectStageOrder);
  const [activeId, setActiveId] = useState(null);
  const [orderedStages, setOrderedStages] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState("95QsEzSA7EGnxrlRqnDShFw");
  const [isStageModalVisible, setIsStageModalVisible] = useState(false);

  // Filter and order lead stages
  const stages = React.useMemo(() => {
    if (!stageQueryData) return [];
    const actualStages = Array.isArray(stageQueryData) ? stageQueryData : (stageQueryData.data || []);

    const leadStages = actualStages.filter(stage =>
      stage.stageType === 'lead' &&
      stage.pipeline === selectedPipeline
    );

    if (savedStageOrder.length > 0 && leadStages.length > 0) {
      const stageOrderMap = new Map(savedStageOrder.map((id, index) => [id, index]));
      return [...leadStages].sort((a, b) => {
        const indexA = stageOrderMap.has(a.id) ? stageOrderMap.get(a.id) : Infinity;
        const indexB = stageOrderMap.has(b.id) ? stageOrderMap.get(b.id) : Infinity;
        return indexA - indexB;
      });
    }

    return leadStages;
  }, [stageQueryData, savedStageOrder, selectedPipeline]);

  // Initialize ordered stages when stages derived from query data change
  useEffect(() => {
    if (stages.length > 0) {
      setOrderedStages(stages);
      if (savedStageOrder.length === 0) {
        dispatch(setStageOrder(stages.map(stage => stage.id)));
      }
    } else {
      setOrderedStages([]);
    }
  }, [stages, dispatch, savedStageOrder.length]);

  const leads = leadsData?.data || [];

  const leadsByStage = React.useMemo(() => {
    return orderedStages.reduce((acc, stage) => {
      acc[stage.id] = leads.filter(lead => lead.leadStage === stage.id);
      return acc;
    }, {});
  }, [orderedStages, leads]);

  // Pipeline selection buttons
  const pipelines = [
    { id: "95QsEzSA7EGnxrlRqnDShFw", name: "Marketing" },
    { id: "cFaSfTBNfdMnnvSNxQmql0w", name: "Sales" }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const isColumn = active.id.toString().startsWith('column-');
    const isCard = active.data?.current?.type === 'card';

    if (isColumn) {
      const oldIndex = orderedStages.findIndex(
        stage => `column-${stage.id}` === active.id
      );
      const newIndex = orderedStages.findIndex(
        stage => `column-${stage.id}` === over.id
      );

      if (oldIndex !== newIndex) {
        const newOrder = arrayMove(orderedStages, oldIndex, newIndex);
        setOrderedStages(newOrder);
        dispatch(setStageOrder(newOrder.map(stage => stage.id)));
      }
    } else if (isCard && over.id !== active.id) {
      const draggedId = active.id;
      const destinationId = over.id.toString().replace('column-', '');

      const draggedLead = leads.find(lead => lead.id === draggedId);

      if (draggedLead?.is_converted) {
        message.error("Cannot move a converted lead");
        return;
      }

      try {
        await updateLead({
          id: draggedId,
          data: {
            leadStage: destinationId,
            updated_by: loggedInUser?.username || ''
          }
        }).unwrap();

        message.success('Lead stage updated successfully');
      } catch (error) {
        message.error('Failed to update lead stage');
      }
    }
  };

  const showStageModal = () => {
    setIsStageModalVisible(true);
  };

  const handleStageModalClose = (didAddStage = false) => {
    setIsStageModalVisible(false);
    if (didAddStage) {
      console.log("Stage added, refetching stages...");
      refetchStages();
    }
  };

  if (isLoadingLeads || isLoadingStages) return <div>Loading...</div>;
  if (errorLeads || errorStages) return <div>Error loading data. Please try again.</div>;

  return (
    <div className="lead-kanban" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        marginBottom: '8px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '0 12px',
        marginTop: '5px'
      }}>
        <Text strong style={{ fontSize: '13px', color: '#374151' }}>Pipeline:</Text>
        <div style={{
          display: 'flex',
          gap: '6px',
          flex: 1
        }}>
          {pipelines.map(pipeline => (
            <Button
              key={pipeline.id}
              type={selectedPipeline === pipeline.id ? "primary" : "default"}
              onClick={() => setSelectedPipeline(pipeline.id)}
              style={{
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                height: '28px',
                fontSize: '12px'
              }}
            >
              <FiTarget style={{ fontSize: '12px' }} />
              {pipeline.name}
            </Button>
          ))}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board-wrapper" style={{
          width: '100%',
          height: 'calc(100vh - 180px)',
          overflow: 'hidden',
          position: 'relative',
          isolation: 'isolate',
          perspective: 1000,
          transformStyle: 'preserve-3d'
        }}>
          <div className="kanban-board" style={{
            display: 'flex',
            gap: '16px',
            padding: '12px',
            width: 'max-content',
            minWidth: '100%',
            height: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            position: 'relative',
            transformStyle: 'preserve-3d',
            perspective: 1000,
            alignItems: 'flex-start'
          }}>
            <SortableContext
              items={orderedStages.map(stage => `column-${stage.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {orderedStages.map((stage, index) => (
                <div key={stage.id} style={{ transform: 'translateZ(0)' }}>
                  <SortableColumn
                    stage={stage}
                    leads={leadsByStage[stage.id] || []}
                    index={index}
                  >
                    <DroppableColumn
                      stage={stage}
                      leads={leadsByStage[stage.id] || []}
                      isColumnDragging={activeId === `column-${stage.id}`}
                    />
                  </SortableColumn>
                </div>
              ))}
            </SortableContext>
            <div style={{
              width: '350px',
              minWidth: '350px',
              height: 'auto',
              paddingTop: '0px'
            }}>
              <Button
                type="dashed"
                onClick={showStageModal}
                style={{
                  width: '100%',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#4b5563',
                  background: '#f9fafb',
                  border: '1px dashed #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  disabled: isLoadingStages
                }}
                disabled={isLoadingStages}
              >
                <FiPlus />
                Add Stage
              </Button>
            </div>
          </div>
        </div>
      </DndContext>

      {/* Use AddLeadStageModal component directly */}
      {isStageModalVisible && (
        <AddLeadStageModal
          isOpen={isStageModalVisible}
          onClose={handleStageModalClose}
          pipelineId={selectedPipeline}
        />
      )}

      <style jsx global>{`
        .kanban-board {
          -webkit-overflow-scrolling: touch;
        }

        .kanban-column-content {
          -webkit-overflow-scrolling: touch;
        }

        .lead-card {
          backface-visibility: hidden;
        }
        
        .kanban-column.is-dragging {
          cursor: grabbing !important;
        }
      `}</style>
    </div>
  );
};

export default LeadCard;